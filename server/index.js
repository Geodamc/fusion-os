import express from 'express';
import cors from 'cors';
import { exec, spawn } from 'child_process';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3001; // Unified Backend Port

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// --- SHARED UTILS ---

const runCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                // Determine if we should treat this as a hard error or just empty output
                // For simple checks, stderr might just be warnings.
                resolve({ success: false, error, stderr, stdout });
            } else {
                resolve({ success: true, stdout: stdout.trim() });
            }
        });
    });
};

const getOutput = async (command) => {
    const res = await runCommand(command);
    return res.success ? res.stdout : "";
};

const CONFIG_PATH = path.join(__dirname, '../fusion-os-config.json');

const getCpuConfig = () => {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = fs.readFileSync(CONFIG_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error reading CPU config:', e);
    }
    return { totalThreads: 16, hostThreads: 2 };
};

// ==========================================
// MODULE 1: VM SET (Setup Wizard)
// ==========================================

const getIsos = () => {
    const essentialsPath = '/var/lib/libvirt/images/fusionos-essentials';
    if (!fs.existsSync(essentialsPath)) return [];
    return fs.readdirSync(essentialsPath).filter(f => f.endsWith('.iso'));
};

app.get('/api/vmset/hardware/gpu', async (req, res) => {
    const output = await getOutput('lspci -nn');
    const lines = output.split('\n');
    const gpus = lines.filter(line => /VGA|Display|3D|Audio/i.test(line))
        .map(line => {
            const match = line.match(/^([0-9a-f:.]+)\s+(.*?)\s+\[([0-9a-f]{4}:[0-9a-f]{4})\]/i);
            if (match) {
                return {
                    pciId: match[1],
                    name: match[2],
                    deviceCode: match[3],
                    isAudio: /Audio/.test(line)
                };
            }
            return null;
        }).filter(g => g !== null);
    res.json(gpus);
});

app.get('/api/vmset/hardware/cpu', async (req, res) => {
    const threads = await getOutput('nproc');
    res.json({ totalThreads: parseInt(threads) || 0 });
});

app.get('/api/vmset/files/isos', (req, res) => {
    res.json(getIsos());
});

app.get('/api/vmset/hardware/usb', async (req, res) => {
    const output = await getOutput('lsusb');
    const lines = output.split('\n');
    const devices = lines.map(line => {
        const match = line.match(/Bus\s+(\d+)\s+Device\s+(\d+):\s+ID\s+([0-9a-fA-F]{4}):([0-9a-fA-F]{4})\s+(.*)/);
        if (match) {
            return {
                bus: match[1],
                device: match[2],
                vendorId: match[3],
                productId: match[4],
                name: match[5]
            };
        }
        return null;
    }).filter(d => d !== null);
    res.json(devices);
});

// --- ISO DOWNLOAD MANAGER REMOVED ---

app.post('/api/vmset/generate', (req, res) => {
    const config = req.body;
    const ENV_NAME = 'win11-2';
    const DISK_PATH = `/var/lib/libvirt/images/${ENV_NAME}-2.qcow2`;
    // Hardcoded ISOs as requested
    const WIN_ISO = 'Win11_25H2_EnglishInternational_x64.iso';

    const vcpus = config.totalThreads - config.hostThreads;
    const reservedThreads = Array.from({ length: config.hostThreads }, (_, i) => i).join('-');
    const shmemSize = config.resolution === '4K' ? 128 : (config.resolution === '1440p' ? 64 : 32);

    // Hardcoded VirtIO ISO
    const virtioIso = 'virtio-win-0.1.285.iso';

    let xml = `
<domain type="kvm">
  <name>${ENV_NAME}</name>
  <metadata>
    <libosinfo:libosinfo xmlns:libosinfo="http://libosinfo.org/xmlns/libvirt/domain/1.0">
      <libosinfo:os id="http://microsoft.com/win/11"/>
    </libosinfo:libosinfo>

  </metadata>
  <memory unit="KiB">${config.ramGB * 1024 * 1024}</memory>
  <currentMemory unit="KiB">${config.ramGB * 1024 * 1024}</currentMemory>
  <vcpu placement="static">${vcpus}</vcpu>
  <iothreads>1</iothreads>
  <cputune>
`;

    for (let i = 0; i < vcpus; i++) {
        xml += `    <vcpupin vcpu="${i}" cpuset="${i + config.hostThreads}"/>\n`;
    }

    xml += `    <emulatorpin cpuset="0-${config.hostThreads - 1}"/>
    <iothreadpin iothread="1" cpuset="0-${config.hostThreads - 1}"/>
    <emulatorsched scheduler="fifo" priority="1"/>
`;

    for (let i = 0; i < vcpus; i++) {
        xml += `    <vcpusched vcpus="${i}" scheduler="fifo" priority="1"/>\n`;
    }

    xml += `  </cputune>
  <os firmware="efi">
    <type arch="x86_64" machine="pc-q35-10.1">hvm</type>
    <loader readonly="yes" secure="yes" type="pflash" format="raw">/usr/share/edk2/x64/OVMF_CODE.secboot.4m.fd</loader>
    <nvram template="/usr/share/edk2/x64/OVMF_VARS.4m.fd" templateFormat="raw" format="raw">/var/lib/libvirt/qemu/nvram/${ENV_NAME}_VARS.fd</nvram>
    <boot dev="hd"/>
  </os>
    <features>
    <acpi/>
    <apic/>
    <hyperv mode="custom">
      <relaxed state="on"/>
      <vapic state="on"/>
      <spinlocks state="on" retries="8191"/>
      <vpindex state="on"/>
      <runtime state="on"/>
      <synic state="on"/>
      <stimer state="on"/>
      <tlbflush state="on"/>
      <ipi state="on"/>
      <avic state="on"/>
    </hyperv>
    <kvm>
      <hidden state="${config.stealthMode ? 'on' : 'off'}"/>
      <hint-dedicated state="on"/>
    </kvm>
    <vmport state="off"/>
    <smm state="on"/>
  </features>
  <cpu mode="host-passthrough" check="none" migratable="on">
    <topology sockets="1" dies="1" clusters="1" cores="${vcpus / 2}" threads="2"/>
    <cache mode="passthrough"/>
    ${config.experimentalDisableHyperV ? '<feature policy="disable" name="hypervisor"/>' : ''}
    <feature policy="require" name="topoext"/>
  </cpu>
  <clock offset="localtime">
    <timer name="rtc" tickpolicy="catchup"/>
    <timer name="pit" tickpolicy="delay"/>
    <timer name="hpet" present="no"/>
    <timer name="hypervclock" present="yes"/>
    <timer name="tsc" present="yes" mode="native"/>
  </clock>
  <pm>
    <suspend-to-mem enabled="no"/>
    <suspend-to-disk enabled="no"/>
  </pm>
    ${config.stealthMode ? `
  <sysinfo type="smbios">
    <baseBoard>
      <entry name="manufacturer">ASUSTeK COMPUTER INC.</entry>
      <entry name="product">ROG STRIX X570-E GAMING</entry>
    </baseBoard>
    <system>
      <entry name="manufacturer">ASUSTeK COMPUTER INC.</entry>
      <entry name="product">ROG STRIX X570-E GAMING</entry>
    </system>
  </sysinfo>` : ''}
  <devices>
    <emulator>/usr/bin/qemu-system-x86_64</emulator>
    <disk type="file" device="disk">
      <driver name="qemu" type="qcow2" cache="none" io="native" discard="unmap"/>
      <source file="${DISK_PATH}"/>
      <target dev="vda" bus="virtio"/>
    </disk>
    <disk type="file" device="cdrom">
      <driver name="qemu" type="raw"/>
      <source file="/var/lib/libvirt/images/fusionos-essentials/${WIN_ISO}"/>
      <target dev="sdb" bus="sata"/>
      <readonly/>
    </disk>`;

    if (virtioIso) {
        xml += `
    <disk type="file" device="cdrom">
      <driver name="qemu" type="raw"/>
      <source file="/var/lib/libvirt/images/fusionos-essentials/${virtioIso}"/>
      <target dev="sdc" bus="sata"/>
      <readonly/>
    </disk>`;
    }

    xml += `
    <controller type="usb" index="0" model="qemu-xhci" ports="15"/>
    <interface type="network">
      <source network="default"/>
      <model type="virtio"/>
      <driver queues="8"/>
    </interface>
    <tpm model="tpm-crb">
      <backend type="emulator" version="2.0"/>
    </tpm>
    <graphics type="spice" autoport="yes">
      <listen type="address"/>
      <image compression="off"/>
    </graphics>
    <audio id="1" type="spice"/>
    <video>
      <model type="qxl" ram="65536" vram="65536" vgamem="16384" heads="1" primary="yes"/>
    </video>
`;

    // USB Devices Passthrough
    if (config.usbDevices && config.usbDevices.length > 0) {
        config.usbDevices.forEach(dev => {
            xml += `
    <hostdev mode="subsystem" type="usb" managed="yes">
      <source>
        <vendor id="0x${dev.vendorId}"/>
        <product id="0x${dev.productId}"/>
      </source>
    </hostdev>`;
        });
    }

    if (config.gpuPciId) {
        xml += `
    <hostdev mode="subsystem" type="pci" managed="yes">
      <driver name="vfio"/>
      <source>
        <address domain="0x0000" bus="${config.gpuPciId.split(':')[0]}" slot="${config.gpuPciId.split(':')[1].split('.')[0]}" function="${config.gpuPciId.split('.')[1]}"/>
      </source>
    </hostdev>`;
    }

    if (config.passAudio && config.audioPciId) {
        xml += `
    <hostdev mode="subsystem" type="pci" managed="yes">
      <driver name="vfio"/>
      <source>
        <address domain="0x0000" bus="${config.audioPciId.split(':')[0]}" slot="${config.audioPciId.split(':')[1].split('.')[0]}" function="${config.audioPciId.split('.')[1]}"/>
      </source>
    </hostdev>`;
    }

    if (config.useLookingGlass) {
        xml += `
    <shmem name="looking-glass">
      <model type="ivshmem-plain"/>
      <size unit="M">${shmemSize}</size>
    </shmem>`;
    }

    // Scream Audio (Shared Memory)
    if (config.useScream) {
        xml += `
    <shmem name="scream-ivshmem">
      <model type="ivshmem-plain"/>
      <size unit="M">2</size>
    </shmem>`;
    }


    if (config.stealthMode) {
        xml = xml.replace('<os firmware="efi">', `<os firmware="efi">\n    <smbios mode="sysinfo"/>`);
    }

    xml += `
  </devices>
</domain>`;

    res.header('Content-Type', 'text/xml');
    res.send(xml);
});

app.post('/api/vmset/create-environment', async (req, res) => {
    const { xml, diskSizeGB, totalThreads, hostThreads, gpuPciId, audioPciId } = req.body;
    const ENV_NAME = 'win11-2';
    const DISK_PATH = `/var/lib/libvirt/images/${ENV_NAME}-2.qcow2`;
    const XML_TEMP = `/tmp/${ENV_NAME}.xml`;

    try {
        // Save shared configuration
        if (totalThreads !== undefined && hostThreads !== undefined) {
            console.log(`Saving shared config to ${CONFIG_PATH}`);
            const configData = { totalThreads, hostThreads, lastEnvName: ENV_NAME, gpuPciId, audioPciId };
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(configData, null, 2));
        }

        // Check if disk exists using virsh (more reliable for permissions)
        const volName = `${ENV_NAME}-2.qcow2`;
        const diskCheck = await runCommand(`virsh -c qemu:///system vol-info --pool default ${volName}`);

        if (!diskCheck.success) {
            console.log("Creating disk volume...");
            // Use virsh vol-create-as to let libvirtd handle permissions
            const createVolRes = await runCommand(`virsh -c qemu:///system vol-create-as default ${volName} ${diskSizeGB}G --format qcow2`);
            if (!createVolRes.success) {
                throw new Error(`Failed to create disk volume: ${createVolRes.stderr || createVolRes.error}`);
            }
        }

        fs.writeFileSync(XML_TEMP, xml);

        // Use virsh define without sudo (relies on user group permissions)
        const defineRes = await runCommand(`virsh -c qemu:///system define ${XML_TEMP}`);
        if (!defineRes.success) {
            throw new Error(`Virsh define failed: ${defineRes.stderr || defineRes.error}`);
        }
        res.json({ success: true, message: "Environment created and defined successfully!", output: defineRes.stdout });
    } catch (err) {
        console.error("VM Creation Error:", err);
        res.status(500).json({ success: false, message: "Failed to create environment", error: err.message });
    }
});


// ==========================================
// MODULE 2: CONFIGURATOR (Kernel/Grub)
// ==========================================

app.post('/api/config/update-grub', (req, res) => {
    const { grubConfig } = req.body;
    if (!grubConfig || !grubConfig.startsWith('GRUB_CMDLINE_LINUX_DEFAULT=')) {
        return res.status(400).json({ error: 'Invalid configuration' });
    }
    const safeConfig = grubConfig.replace(/'/g, "'\\''");
    const sedCommand = `sudo sed -i 's|^GRUB_CMDLINE_LINUX_DEFAULT=.*|${safeConfig}|' /etc/default/grub`;

    exec(sedCommand, (error) => {
        if (error) return res.status(500).json({ error: 'Failed to update GRUB file' });
        exec('sudo grub-mkconfig -o /boot/grub/grub.cfg', (err) => {
            if (err) return res.status(500).json({ error: 'Failed to apply GRUB config' });
            res.json({ success: true, message: 'GRUB updated!' });
        });
    });
});

app.get('/api/config/get-gpus', async (req, res) => {
    try {
        const lspciOutput = await getOutput('lspci -nn');
        const lines = lspciOutput.split('\n');
        const devices = lines.map(line => {
            const parts = line.match(/^([0-9a-f:.]+)\s+(.*?)\s+\[([0-9a-f]{4}:[0-9a-f]{4})\]/i);
            return parts ? { slot: parts[1], name: parts[2], id: parts[3] } : null;
        }).filter(d => d !== null);

        if (devices.length === 0) {
            console.warn('No PCI devices detected by lspci -nn parser');
        }

        const gpus = [];
        devices.forEach(dev => {
            if (dev.name.toLowerCase().includes('vga') || dev.name.toLowerCase().includes('3d controller')) {
                const gpu = { name: dev.name, gpuId: dev.id, slot: dev.slot, audioId: null };
                const [busDev] = dev.slot.split('.');
                const audioDev = devices.find(d => d.slot.startsWith(busDev) && d.name.toLowerCase().includes('audio'));
                if (audioDev) gpu.audioId = audioDev.id;
                gpus.push(gpu);
            }
        });
        res.json({ gpus });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.post('/api/config/apply-vfio', async (req, res) => {
    const { gpuIds, guestBrand } = req.body;
    try {
        const mkinitcpioPath = '/etc/mkinitcpio.conf';
        let mkinitcpioContent = await getOutput(`cat ${mkinitcpioPath}`);
        const modulesRegex = /^MODULES=\(([^)]*)\)/m;
        const match = mkinitcpioContent.match(modulesRegex);

        if (match) {
            let modulesList = match[1].trim().split(/\s+/);
            const requiredModules = ['vfio_pci', 'vfio', 'vfio_iommu_type1'];
            let changed = false;
            requiredModules.forEach(mod => {
                if (!modulesList.includes(mod)) { modulesList.push(mod); changed = true; }
            });

            if (changed) {
                mkinitcpioContent = mkinitcpioContent.replace(modulesRegex, `MODULES=(${modulesList.join(' ')})`);
                const tempFile = `/tmp/mkinitcpio.conf.tmp`;
                fs.writeFileSync(tempFile, mkinitcpioContent);
                await getOutput(`sudo cp ${tempFile} ${mkinitcpioPath}`);
            }
        }

        const vfioIds = gpuIds.join(',');
        await getOutput(`echo "options vfio-pci ids=${vfioIds}" | sudo tee /etc/modprobe.d/vfio.conf`);

        if (guestBrand === 'Nvidia') {
            await getOutput(`echo "blacklist nouveau\nblacklist nvidia\nblacklist nvidia_drm\nblacklist nvidia_modeset" | sudo tee /etc/modprobe.d/blacklist-gpu.conf`);
        }
        await getOutput('sudo mkinitcpio -p linux-cachyos');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});


// ==========================================
// MODULE 3: CONTROL CENTER (Management)
// ==========================================

const VM_IMAGE_PATH_BASE = '/var/lib/libvirt/images/';

app.get('/api/control/config', (req, res) => {
    res.json(getCpuConfig());
});

const getVmImagePath = () => {
    const name = getCpuConfig().lastEnvName || 'win11-2';
    return `${VM_IMAGE_PATH_BASE}${name}-2.qcow2`;
};

app.post('/api/control/cpu', async (req, res) => {
    const { target } = req.body;
    const cpuConfig = getCpuConfig();
    const { totalThreads, hostThreads } = cpuConfig;

    let command = '';
    const slices = ['background.slice', 'session.slice', 'system.slice', 'user.slice'];
    const fullRange = `0-${totalThreads - 1}`;

    if (target === 'windows') {
        const range = hostThreads > 1 ? `0-${hostThreads - 1}` : '0';
        // Use --runtime to prevent persistent lockouts
        command = slices.map(s => `sudo systemctl set-property --runtime ${s} AllowedCPUs=${range}`).join(' && ');
    } else if (target === 'linux') {
        // Use --runtime and explicit full range to ensure all cores are freed
        const fullRangeLimit = totalThreads > 1 ? `0-${totalThreads - 1}` : '0';
        command = slices.map(s => `sudo systemctl set-property --runtime ${s} AllowedCPUs=${fullRangeLimit}`).join(' && ');
    }

    if (command) {
        const resObj = await runCommand(command);
        if (resObj.success) {
            res.json({ success: true, output: resObj.stdout });
        } else {
            console.error("CPU Allocation Error:", resObj.stderr || resObj.error);
            res.status(500).json({ success: false, error: resObj.stderr || resObj.error });
        }
    } else {
        res.status(400).json({ error: 'Invalid target' });
    }
});

app.post('/api/control/gpu', async (req, res) => {
    const { target, pciId } = req.body;
    let command = '';

    let targetPciId = pciId;

    // If no pciId provided, try to find it in the saved config
    if (!targetPciId) {
        targetPciId = getCpuConfig().gpuPciId;
    }

    // Fallback to auto-detection if still not found
    if (!targetPciId) {
        const lspciLong = await getOutput('lspci -nn');
        const match = lspciLong.match(/([0-9a-f]{2}:[0-9a-f]{2}\.[0-9]).*?(VGA|3D)/i);
        if (match) targetPciId = match[1];
    }

    if (!targetPciId) {
        return res.status(400).json({ error: 'No suitable GPU found for toggle' });
    }

    const nodedevId = `pci_0000_${targetPciId.replace(/:/g, '_').replace(/\./g, '_')}`;

    if (target === 'windows') {
        command = `sudo rmmod nvidia_modeset nvidia_uvm nvidia || true && sudo modprobe -v vfio_pci vfio_pci_core vfio_iommu_type1 && sudo virsh nodedev-detach ${nodedevId}`;
    } else if (target === 'linux') {
        command = `sudo virsh nodedev-reattach ${nodedevId} && sudo rmmod vfio_pci vfio_pci_core vfio_iommu_type1 && sudo modprobe -v nvidia_modeset nvidia_uvm nvidia`;
    }

    if (command) {
        console.log(`Executing GPU Toggle [Target: ${target}]: ${command}`);
        const resObj = await runCommand(command);
        if (resObj.success) {
            console.log(`GPU Toggle Success: ${resObj.stdout}`);
            res.json({ success: true, output: resObj.stdout });
        } else {
            console.error(`GPU Toggle ERROR: ${resObj.stderr || resObj.error}`);
            res.status(500).json({ success: false, error: resObj.stderr || resObj.error });
        }
    } else {
        res.status(400).json({ error: 'Invalid target' });
    }
});

app.get('/api/control/cpu-status', async (req, res) => {
    try {
        const output = await getOutput('systemctl show property system.slice -p AllowedCPUs');
        // Output format: AllowedCPUs=0-15 or AllowedCPUs=0-31 etc.
        const match = output.match(/AllowedCPUs=([\d\-,]+)/);

        // Default to 'linux' if we can't determine restriction
        let status = 'linux';

        if (match) {
            const range = match[1];
            // If range is subset of total host threads, it's likely Windows/Shared mode
            // Simple heuristic: if it looks like full range, it's Linux.
            // Better heuristic: Check against known host config.

            const cpuConfig = getCpuConfig();
            const { hostThreads, totalThreads } = cpuConfig;

            // "Windows" mode usually restricts system.slice to hostThreads (e.g. 0-1)
            // "Linux" mode gives system.slice all threads (e.g. 0-15)

            // If the range max is less than totalThreads - 1, it's restricted (Windows mode)
            const maxThread = parseInt(range.split('-').pop() || '0');

            if (maxThread < (totalThreads - 1)) {
                status = 'windows';
            }
        }
        res.json({ success: true, target: status });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/control/gpu-status', async (req, res) => {
    try {
        const output = await getOutput('lspci -k');
        let owner = 'linux';

        // More robust check: see if vfio-pci is actually controlling a VGA device
        if (output.match(/VGA compatible controller.*?\n\s+Kernel driver in use: vfio-pci/si) ||
            output.match(/3D controller.*?\n\s+Kernel driver in use: vfio-pci/si)) {
            owner = 'windows';
        }

        res.json({ success: true, owner });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const VM_NAME_CONFIG = getCpuConfig().lastEnvName || 'win11-2';

app.get('/api/control/vm-status', async (req, res) => {
    const name = getCpuConfig().lastEnvName || VM_NAME_CONFIG;
    const output = await getOutput(`virsh -c qemu:///system domstate ${name}`);
    res.json({ status: output.trim() || 'shut off' });
});

app.post('/api/control/vm-power', async (req, res) => {
    const { action } = req.body;
    const name = getCpuConfig().lastEnvName || 'win11-2';
    console.log(`[VM POWER] Executing ${action} for VM: ${name}`);

    const command = action === 'start'
        ? `virsh -c qemu:///system start ${name}`
        : `virsh -c qemu:///system shutdown ${name}`;

    try {
        const result = await runCommand(command);
        if (!result.success) {
            console.error(`[VM POWER ERROR] Command failed: ${command}`, result.stderr);
            return res.status(500).json({
                success: false,
                error: result.stderr || "Libvirt command failed. Check if the VM name is correct and virsh has permissions."
            });
        }
        console.log(`[VM POWER SUCCESS] ${action} completed for ${name}`);
        res.json({ success: true });
    } catch (err) {
        console.error(`[VM POWER CRITICAL]`, err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/control/disk-info', (req, res) => {
    const imagePath = getVmImagePath();
    exec(`sudo qemu-img info ${imagePath}`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: error.message });
        const match = stdout.match(/virtual size:\s+([0-9.]+)\s+([KMGT]i?B)/i);
        let sizeGB = 128;
        if (match) {
            const size = parseFloat(match[1]);
            const unit = match[2].toUpperCase();
            if (unit.startsWith('G')) sizeGB = Math.round(size);
        }
        res.json({ success: true, diskSizeGB: sizeGB });
    });
});

app.post('/api/control/expand-disk', (req, res) => {
    const { expansionGB } = req.body;
    if (!expansionGB || expansionGB <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const imagePath = getVmImagePath();
    exec(`sudo qemu-img info ${imagePath}`, (error, stdout) => {
        const match = stdout.match(/virtual size:\s+([0-9.]+)\s+([KMGT]i?B)/i);
        let currentGB = 128;
        if (match) {
            const size = parseFloat(match[1]);
            const unit = match[2].toUpperCase();
            if (unit.startsWith('G')) currentGB = Math.round(size);
        }
        const newSizeGB = currentGB + expansionGB;
        runCommand(`sudo qemu-img resize ${imagePath} ${newSizeGB}G`).then(r => {
            res.json({ success: true, newSizeGB });
        });
    });
});

app.post('/api/control/restart_cpu', (req, res) => {
    const user = process.env.USER || 'root';
    runCommand(`sudo loginctl terminate-user ${user}`).then(r => res.json(r));
});

app.post('/api/control/create-snapshot', (req, res) => {
    const { name, description } = req.body;
    const vmName = getCpuConfig().lastEnvName || 'win11-2';
    const command = `virsh -c qemu:///system snapshot-create-as --domain ${vmName} --name "${name}" --description "${description || ''}" --atomic`;
    runCommand(command).then(r => res.json(r));
});

app.get('/api/control/list-snapshots', (req, res) => {
    const vmName = getCpuConfig().lastEnvName || 'win11-2';
    exec(`virsh -c qemu:///system snapshot-list ${vmName}`, (error, stdout) => {
        if (error) return res.json({ success: false, error: error.message });
        const lines = stdout.split('\n');
        const snapshots = [];
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.startsWith('-')) {
                const parts = line.split(/\s+/);
                if (parts.length >= 3) {
                    snapshots.push({ name: parts[0], creationTime: parts.slice(1, -1).join(' '), state: parts[parts.length - 1] });
                }
            }
        }
        res.json({ success: true, snapshots });
    });
});

app.post('/api/control/revert-snapshot', (req, res) => {
    const vmName = getCpuConfig().lastEnvName || 'win11-2';
    runCommand(`virsh -c qemu:///system snapshot-revert ${vmName} --snapshotname "${req.body.snapshotName}" --running`).then(r => res.json(r));
});

app.post('/api/control/delete-snapshot', (req, res) => {
    const vmName = getCpuConfig().lastEnvName || 'win11-2';
    runCommand(`virsh -c qemu:///system snapshot-delete ${vmName} --snapshotname "${req.body.snapshotName}"`).then(r => res.json(r));
});

app.listen(PORT, () => {
    console.log(`Unified Fusion OS Server running on http://localhost:${PORT}`);
});
