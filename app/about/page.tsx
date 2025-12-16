
import React from 'react'

export const metadata = {
    title: 'About Us | MyStore',
    description: 'About MyStore and get in touch with us.',
}

export default function AboutPage() {
    return (
        <main className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="space-y-8">
                <section className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">About Us</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Welcome to MyStore. We are dedicated to providing the best products with an exceptional shopping experience.
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-12 mt-12">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold">Get in Touch</h2>
                        <p className="text-muted-foreground">
                            Have questions or feedback? We'd love to hear from you. Fill out the form or reach us directly via email.
                        </p>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Email Us</p>
                                <a href="mailto:luckyhegdedev@gmail.com" className="text-indigo-600 hover:text-indigo-500">
                                    luckyhegdedev@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-semibold mb-6">Send a Message</h3>

                        <form
                            name="contact"
                            method="POST"
                            data-netlify="true"
                            className="space-y-4"
                        >
                            <input type="hidden" name="form-name" value="contact" />

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Your name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    name="message"
                                    id="message"
                                    rows={4}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                    placeholder="How can we help?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-black text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    )
}
