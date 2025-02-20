'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import FeaturedPost from '@/components/FeaturedPost';
import BlogPosts from '@/components/BlogPosts';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <section className="mb-16">
          <FeaturedPost />
        </section>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BlogPosts />
          </div>
          <Sidebar />
        </div>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
} 