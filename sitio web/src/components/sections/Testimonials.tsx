'use client';

import { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const defaultTestimonials = [
    {
        text: "I literally broke my PC into two pieces yesterday, but then I found FusionOS and now it works perfectly. Geometry is a lie.",
        name: 'Salva',
        username: '@salva_stark',
    },
    {
        text: "FusionOS is so fast it runs Minecraft at 1000 FPS on my toaster. My kitchen smells like burnt toast and victory.",
        name: 'Rafa',
        username: '@rafa_the_boss',
    },
    {
        text: "I had no idea what a VM was. Now I have 5 Windows instances running just to watch them fight each other.",
        name: 'Lukas',
        username: '@super_lukas',
    },
    {
        text: "WOOF! The UI is so shiny I tried to lick the screen and now my tongue is pixelated. 13/10 good boy experience.",
        name: 'Otto',
        username: '@otto_dog',
    },
    {
        text: "I installed FusionOS and my radiator became a server rack. My cat is now a 10Gbps Ethernet switch and my grandmother is mining Ethereum in her sleep. Help.",
        name: 'Cristobal',
        username: '@datacenter_home',
    },
    {
        text: "I optimized my brain with FusionOS and discovered a 9th color. It's called 'Blorg' and it's extremely loud. I can't stop seeing the world in hex code. 10/10 experience.",
        name: 'Santi',
        username: '@binary_vision',
    },
];

interface TestimonialProps {
    testimonials?: {
        text: string;
        name: string;
        username: string;
    }[];
    title?: string;
    subtitle?: string;
    autoplaySpeed?: number;
    className?: string;
}

export default function TestimonialsCarousel({
    testimonials = defaultTestimonials,
    title = 'Words from the Wise',
    subtitle = 'Real reviews from definitely real people who totally exist and arent inside our basement.',
    autoplaySpeed = 3000,
    className,
}: TestimonialProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center',
        containScroll: 'trimSnaps',
        dragFree: true,
    });

    useEffect(() => {
        if (!emblaApi) return;

        const autoplay = setInterval(() => {
            emblaApi.scrollNext();
        }, autoplaySpeed);

        return () => {
            clearInterval(autoplay);
        };
    }, [emblaApi, autoplaySpeed]);

    const allTestimonials = [...testimonials, ...testimonials];

    return (
        <section
            className={cn('relative overflow-hidden py-16 md:py-24 bg-transparent text-white', className)}
        >
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="relative mb-12 text-center md:mb-16"
                >
                    <h1 className="from-white to-white/40 mb-4 bg-gradient-to-b bg-clip-text text-4xl font-black text-transparent md:text-6xl lg:text-8xl drop-shadow-md tracking-tighter uppercase">
                        {title}
                    </h1>

                    <motion.p
                        className="text-white/80 mx-auto max-w-2xl text-base md:text-lg font-medium drop-shadow-sm"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        viewport={{ once: true }}
                    >
                        {subtitle}
                    </motion.p>
                </motion.div>
            </div>

            {/* Testimonials carousel - FULL WIDTH */}
            <div className="w-full overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {allTestimonials.map((testimonial, index) => (
                        <div
                            key={`${testimonial.name}-${index}`}
                            className="flex justify-center px-4 min-h-[350px]"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="border-white/20 relative h-full w-[350px] rounded-2xl border bg-white/10 p-6 shadow-xl backdrop-blur-md flex flex-col"
                            >
                                <div className="text-white/20 mb-4">
                                    <Quote className="h-10 w-10 -rotate-180" />
                                </div>

                                <p className="text-white relative mb-6 text-base leading-relaxed italic font-medium flex-1">
                                    <span className="relative">"{testimonial.text}"</span>
                                </p>

                                <div className="border-white/10 mt-auto flex items-center gap-3 border-t pt-4">
                                    <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-md">
                                        <span className="text-white font-black uppercase text-lg">
                                            {testimonial.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <h4 className="text-white font-black whitespace-nowrap">
                                            {testimonial.name}
                                        </h4>
                                        <p className="text-white/60 text-sm whitespace-nowrap font-bold">
                                            {testimonial.username}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
