/**
 * Footer Component
 */

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-900 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">🚆</span>
                            </div>
                            <span className="text-xl font-bold text-white">TrainBook</span>
                        </div>
                        <p className="text-slate-400 text-sm max-w-md">
                            A comprehensive train seat reservation system for booking tickets, 
                            checking PNR status, viewing schedules, and tracking live train status.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/search" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Search Trains</Link></li>
                            <li><Link to="/pnr-status" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">PNR Status</Link></li>
                            <li><Link to="/train-schedule" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Train Schedule</Link></li>
                            <li><Link to="/live-train-status" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Live Status</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li><a href="#help" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Help Center</a></li>
                            <li><a href="#contact" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Contact Us</a></li>
                            <li><a href="#faq" className="text-slate-400 hover:text-blue-400 text-sm transition-colors">FAQs</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-500 text-sm">
                        © 2024 TrainBook. Powered by ServerPE
                    </p>
                    <p className="text-slate-500 text-sm mt-2 md:mt-0">
                        Student Project - Mock Data Only
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
