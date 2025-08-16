import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  Shield,
  Users,
  Globe,
  Zap,
  Award,
  Heart,
  Target,
  Rocket,
  Star,
  CheckCircle2,
  TrendingUp,
  Clock,
  Lock
} from "lucide-react";
import { SiWordpress } from "react-icons/si";

export default function About() {
  const stats = [
    { number: "65,000+", label: "WordPress Professionals", icon: <Users className="w-6 h-6" /> },
    { number: "500,000+", label: "Websites Managed", icon: <Globe className="w-6 h-6" /> },
    { number: "99.9%", label: "Uptime Guarantee", icon: <Shield className="w-6 h-6" /> },
    { number: "24/7", label: "Support Available", icon: <Clock className="w-6 h-6" /> }
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Security First",
      description: "We prioritize the security of your websites with advanced scanning, monitoring, and protection mechanisms."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Performance Focused",
      description: "Our tools are designed to optimize and monitor your website performance, ensuring fast loading times."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Customer Centric",
      description: "Your success is our success. We build features based on real user feedback and needs."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Passion Driven",
      description: "We're passionate about WordPress and helping professionals manage their sites more efficiently."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "15+ years in WordPress development and agency management",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b3fd?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Former WordPress core contributor and security expert",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      bio: "UX designer with a focus on developer tools and workflows",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "David Park",
      role: "Lead Engineer",
      bio: "Full-stack developer specializing in scalable web applications",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    }
  ];

  const milestones = [
    {
      year: "2018",
      title: "Company Founded",
      description: "Started with a simple vision to make WordPress management easier"
    },
    {
      year: "2019",
      title: "First 1,000 Users",
      description: "Reached our first milestone with features that users love"
    },
    {
      year: "2021",
      title: "Enterprise Launch",
      description: "Launched enterprise features for larger agencies and businesses"
    },
    {
      year: "2023",
      title: "Global Expansion",
      description: "Expanded to serve WordPress professionals worldwide"
    },
    {
      year: "2024",
      title: "AI Integration",
      description: "Introduced AI-powered insights and automated maintenance"
    },
    {
      year: "2025",
      title: "65,000+ Users",
      description: "Trusted by over 65,000 WordPress professionals globally"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="bg-white/95 border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                  <SiWordpress className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-slate-900">AIO Webcare</h1>
                <p className="text-sm text-slate-600 font-medium hidden sm:block">Professional WordPress Management</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Home</a>
              <a href="/features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Features</a>
              <a href="/pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
              <a href="/about" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">About</a>
              <a href="/contact" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Contact</a>
            </nav>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild className="hidden sm:flex bg-white/90 border-slate-300">
                <a href="/login">Sign In</a>
              </Button>
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                <a href="/register">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Award className="w-4 h-4 mr-2 text-yellow-500" />
            Trusted by 65,000+ professionals
          </Badge>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Making WordPress
            <span className="block text-blue-600">Management Simple</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to simplify WordPress management for professionals worldwide. 
            Our platform combines powerful automation with intuitive design to help you focus on what matters most.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-white shadow-xl">
              <a href="/contact">
                Get in Touch
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-2 bg-white/90">
              <Rocket className="mr-2 h-5 w-5" />
              Our Story
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{stat.number}</div>
                  <p className="text-slate-600 font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                <p>
                  AIO Webcare was born out of frustration with the complexity of managing multiple WordPress sites. 
                  Our founders, experienced WordPress developers and agency owners, knew there had to be a better way.
                </p>
                <p>
                  In 2018, we set out to create a platform that would eliminate the need for spreadsheets, bookmarks, 
                  and multiple tools. Our vision was simple: one dashboard to rule them all.
                </p>
                <p>
                  Today, we're proud to serve over 65,000 WordPress professionals worldwide, helping them manage 
                  hundreds of thousands of websites with ease and confidence.
                </p>
              </div>
              <div className="mt-8">
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                  <a href="/features">
                    Explore Our Features
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <SiWordpress className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">WordPress Management</h3>
                  <p className="text-blue-100">Simplified & Automated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 lg:py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The principles that guide everything we do and every decision we make
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all group">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                      {value.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      {value.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Key milestones in our mission to revolutionize WordPress management
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  {/* Content */}
                  <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-16' : 'lg:pl-16'}`}>
                    <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="secondary" className="px-3 py-1 font-semibold">
                            {milestone.year}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900">
                          {milestone.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  
                  {/* Spacer for other side */}
                  <div className="lg:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The passionate people behind AIO Webcare
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all group text-center">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-slate-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Join Our Growing Community
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Become part of the 65,000+ WordPress professionals who trust AIO Webcare 
            for their website management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl">
              <a href="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600">
              <Star className="mr-2 h-5 w-5" />
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <SiWordpress className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AIO Webcare</h3>
                  <p className="text-slate-400">Professional WordPress Management</p>
                </div>
              </div>
              <p className="text-slate-400 max-w-md">
                The comprehensive WordPress maintenance platform trusted by professionals worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-400">© 2025 AIO Webcare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}