export type ModuleFieldType = 'text' | 'textarea' | 'image' | 'video' | 'color' | 'boolean' | 'select' | 'richtext' | 'list';

export type ModuleField = {
  name: string;
  label: string;
  type: ModuleFieldType;
  defaultValue?: any;
  placeholder?: string;
  description?: string;
  options?: { label: string, value: string }[]; // For 'select' type
  itemFields?: Omit<ModuleField, 'itemFields'>[];
};

export type ModuleDefinition = {
  type: string;
  label: string;
  description: string;
  fields: ModuleField[];
  defaultConfig: Record<string, any>;
};

export const MODULES: Record<string, ModuleDefinition> = {
  HeroSection: {
    type: 'HeroSection',
    label: 'Hero Section',
    description: 'A full-screen hero section with a heading and call-to-action.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', defaultValue: 'Beautifully designed experiences' },
      { name: 'subheading', label: 'Subheading', type: 'textarea', defaultValue: 'Built with modern tools. We deliver high performance scalable solutions.' },
      { name: 'buttonText', label: 'Primary Button Text', type: 'text', defaultValue: 'View Services' },
      { name: 'buttonUrl', label: 'Primary Button URL', type: 'text', defaultValue: '/services' },
      { name: 'secondaryButtonText', label: 'Secondary Button Text', type: 'text', defaultValue: 'Contact Us' },
      { name: 'secondaryButtonUrl', label: 'Secondary Button URL', type: 'text', defaultValue: '/contact' },
      { name: 'backgroundImage', label: 'Background Image URL', type: 'image', defaultValue: '' },
    ],
    defaultConfig: {
      heading: 'Beautifully designed experiences',
      subheading: 'Built with modern tools. We deliver high performance scalable solutions.',
      buttonText: 'View Services',
      buttonUrl: '/services',
      secondaryButtonText: 'Contact Us',
      secondaryButtonUrl: '/contact',
      backgroundImage: '',
    }
  },
  CTASection: {
    type: 'CTASection',
    label: 'Call to Action',
    description: 'A simple block to drive conversions.',
    fields: [
      { name: 'title', label: 'Title', type: 'text', defaultValue: 'Ready to get started?' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea', defaultValue: 'Join us today and transform your business.' },
      { name: 'buttonText', label: 'Button Text', type: 'text', defaultValue: 'Get in Touch' },
      { name: 'buttonUrl', label: 'Button URL', type: 'text', defaultValue: '/contact' },
      { name: 'backgroundColor', label: 'Background Color (Hex)', type: 'color', defaultValue: '#0f172a' },
    ],
    defaultConfig: {
      title: 'Ready to get started?',
      subtitle: 'Join us today and transform your business.',
      buttonText: 'Get in Touch',
      buttonUrl: '/contact',
      backgroundColor: '#0f172a',
    }
  },
  ServicesSection: {
    type: 'ServicesSection',
    label: 'Services Grid',
    description: 'Displays a grid of your services.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', defaultValue: 'Our Services' },
      { name: 'subheading', label: 'Subheading', type: 'textarea', defaultValue: 'What we can do for you' },
      { 
        name: 'items', 
        label: 'Services', 
        type: 'list', 
        itemFields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'icon', label: 'Icon (Lucide name)', type: 'text', defaultValue: 'Wrench' }
        ]
      }
    ],
    defaultConfig: { 
      heading: 'Our Services', 
      subheading: 'What we can do for you',
      items: [
        { title: 'Web Development', description: 'Custom web applications built with modern tools.', icon: 'Code' },
        { title: 'UI/UX Design', description: 'Beautiful and intuitive user interfaces.', icon: 'PenTool' },
        { title: 'Digital Marketing', description: 'Grow your business with targeted campaigns.', icon: 'TrendingUp' }
      ]
    }
  },
  PortfolioSection: {
    type: 'PortfolioSection',
    label: 'Portfolio Showcase',
    description: 'Displays recent portfolio projects.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', defaultValue: 'Featured Work' },
      { name: 'subheading', label: 'Subheading', type: 'textarea', defaultValue: 'Some of our recent projects' },
      {
        name: 'items',
        label: 'Projects',
        type: 'list',
        itemFields: [
          { name: 'title', label: 'Project Title', type: 'text' },
          { name: 'category', label: 'Category', type: 'text' },
          { name: 'image', label: 'Project Image URL', type: 'image' }
        ]
      }
    ],
    defaultConfig: { 
      heading: 'Featured Work', 
      subheading: 'Some of our recent projects',
      items: [
        { title: 'E-commerce Platform', category: 'Web Development', image: '' },
        { title: 'Finance Dashboard', category: 'UI/UX Design', image: '' }
      ]
    }
  },
  BlogSection: {
    type: 'BlogSection',
    label: 'Latest News',
    description: 'Displays latest blog posts fetched from the CMS.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', defaultValue: 'Latest Insights' },
      { name: 'subheading', label: 'Subheading', type: 'textarea', defaultValue: 'News and articles from our team' },
      { name: 'limit', label: 'Number of items to show', type: 'text', defaultValue: '3' }
    ],
    defaultConfig: { heading: 'Latest Insights', subheading: 'News and articles from our team', limit: '3' }
  },
  TestimonialsSection: {
    type: 'TestimonialsSection',
    label: 'Testimonials',
    description: 'Displays client reviews.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', defaultValue: 'What Clients Say' },
      { name: 'subheading', label: 'Subheading', type: 'textarea', defaultValue: 'Don\'t just take our word for it' },
      { name: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#f8fafc' },
      {
        name: 'items',
        label: 'Reviews',
        type: 'list',
        itemFields: [
          { name: 'name', label: 'Client Name', type: 'text' },
          { name: 'company', label: 'Company', type: 'text' },
          { name: 'content', label: 'Review Content', type: 'textarea' },
          { name: 'avatar', label: 'Avatar URL', type: 'image' }
        ]
      }
    ],
    defaultConfig: { 
      heading: 'What Clients Say', 
      subheading: 'Don\'t just take our word for it', 
      backgroundColor: '#f8fafc',
      items: [
        { name: 'Jane Doe', company: 'Tech Inc', content: 'Incredible work and fast delivery!', avatar: '' }
      ]
    }
  },
  TeamSection: {
    type: 'TeamSection',
    label: 'Team Members',
    description: 'Displays team members.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', defaultValue: 'Meet the Team' },
      { name: 'subheading', label: 'Subheading', type: 'textarea', defaultValue: 'The people behind the magic' },
      {
        name: 'items',
        label: 'Members',
        type: 'list',
        itemFields: [
          { name: 'name', label: 'Name', type: 'text' },
          { name: 'role', label: 'Role', type: 'text' },
          { name: 'image', label: 'Profile Image URL', type: 'image' },
          { name: 'linkedin', label: 'LinkedIn URL', type: 'text' }
        ]
      }
    ],
    defaultConfig: { 
      heading: 'Meet the Team', 
      subheading: 'The people behind the magic',
      items: [
        { name: 'John Smith', role: 'CEO', image: '', linkedin: '#' }
      ]
    }
  },
  FAQSection: {
    type: 'FAQSection',
    label: 'FAQ Accordion',
    description: 'Displays FAQs.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', defaultValue: 'Frequently Asked Questions' },
      { name: 'subheading', label: 'Subheading', type: 'textarea', defaultValue: 'Got questions? We have answers.' },
      {
        name: 'items',
        label: 'Questions & Answers',
        type: 'list',
        itemFields: [
          { name: 'question', label: 'Question', type: 'text' },
          { name: 'answer', label: 'Answer', type: 'textarea' }
        ]
      }
    ],
    defaultConfig: { 
      heading: 'Frequently Asked Questions', 
      subheading: 'Got questions? We have answers.',
      items: [
        { question: 'What is your turnaround time?', answer: 'Typically 2-4 weeks depending on the project scope.' },
        { question: 'Do you provide ongoing support?', answer: 'Yes, we offer maintenance plans for all our clients.' }
      ]
    }
  },
  StatsSection: {
    type: 'StatsSection',
    label: 'Statistics',
    description: 'Displays up to 4 key numbers/statistics.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', defaultValue: 'By the Numbers' },
      { name: 'subheading', label: 'Subheading', type: 'textarea', defaultValue: 'Our impact so far' },
      { name: 'stat1Value', label: 'Stat 1 Value', type: 'text', defaultValue: '500+' },
      { name: 'stat1Label', label: 'Stat 1 Label', type: 'text', defaultValue: 'Projects Completed' },
      { name: 'stat2Value', label: 'Stat 2 Value', type: 'text', defaultValue: '50+' },
      { name: 'stat2Label', label: 'Stat 2 Label', type: 'text', defaultValue: 'Team Members' },
      { name: 'stat3Value', label: 'Stat 3 Value', type: 'text', defaultValue: '99%' },
      { name: 'stat3Label', label: 'Stat 3 Label', type: 'text', defaultValue: 'Client Satisfaction' },
      { name: 'stat4Value', label: 'Stat 4 Value', type: 'text', defaultValue: '10M+' },
      { name: 'stat4Label', label: 'Stat 4 Label', type: 'text', defaultValue: 'Revenue Generated' },
    ],
    defaultConfig: { 
      heading: 'By the Numbers', subheading: 'Our impact so far',
      stat1Value: '500+', stat1Label: 'Projects Completed',
      stat2Value: '50+', stat2Label: 'Team Members',
      stat3Value: '99%', stat3Label: 'Client Satisfaction',
      stat4Value: '10M+', stat4Label: 'Revenue Generated'
    }
  },
  AboutSection: {
    type: 'AboutSection',
    label: 'About Us',
    description: 'A split section with image and text.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', defaultValue: 'About HexaPixora' },
      { name: 'content', label: 'Content', type: 'textarea', defaultValue: 'We are a digital agency passionate about building great products. With years of experience and a highly skilled team, we deliver scalable solutions.' },
      { name: 'image', label: 'Image URL', type: 'image', defaultValue: '' }
    ],
    defaultConfig: { heading: 'About HexaPixora', content: 'We are a digital agency passionate about building great products. With years of experience and a highly skilled team, we deliver scalable solutions.', image: '' }
  },
  YouTubeEmbedModule: {
    type: 'YouTubeEmbedModule',
    label: 'YouTube Embed',
    description: 'Embed a YouTube video seamlessly.',
    fields: [
      { name: 'videoUrl', label: 'YouTube Video URL', type: 'text', placeholder: 'https://youtube.com/watch?v=...' },
      { name: 'autoplay', label: 'Autoplay', type: 'boolean', defaultValue: false },
      { name: 'muted', label: 'Muted', type: 'boolean', defaultValue: false },
      { name: 'controls', label: 'Show Controls', type: 'boolean', defaultValue: true },
      { name: 'loop', label: 'Loop Video', type: 'boolean', defaultValue: false },
    ],
    defaultConfig: {
      videoUrl: '',
      autoplay: false,
      muted: false,
      controls: true,
      loop: false,
    }
  },
  GalleryModule: {
    type: 'GalleryModule',
    label: 'Image Gallery',
    description: 'A responsive grid gallery for images.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', defaultValue: 'Our Gallery' },
      { name: 'columns', label: 'Grid Columns', type: 'select', defaultValue: '3', options: [{label: '2 Columns', value: '2'}, {label: '3 Columns', value: '3'}, {label: '4 Columns', value: '4'}] },
      {
        name: 'images',
        label: 'Gallery Images',
        type: 'list',
        itemFields: [
          { name: 'url', label: 'Image', type: 'image' },
          { name: 'caption', label: 'Caption (Optional)', type: 'text' }
        ]
      }
    ],
    defaultConfig: {
      heading: 'Our Gallery',
      columns: '3',
      images: []
    }
  },
  VideoPlayerModule: {
    type: 'VideoPlayerModule',
    label: 'Native Video Player',
    description: 'High performance native HTML5 video player.',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text', defaultValue: 'Featured Videos' },
      { name: 'layout', label: 'Layout Strategy', type: 'select', defaultValue: 'single', options: [{label: 'Single Large Video', value: 'single'}, {label: 'Multiple (Grid)', value: 'grid'}] },
      { name: 'autoplay', label: 'Autoplay (Mutes video)', type: 'boolean', defaultValue: false },
      { name: 'loop', label: 'Loop Video', type: 'boolean', defaultValue: true },
      { name: 'controls', label: 'Show Controls', type: 'boolean', defaultValue: true },
      {
        name: 'videos',
        label: 'Videos',
        type: 'list',
        itemFields: [
          { name: 'videoUrl', label: 'Video File', type: 'video' },
          { name: 'posterUrl', label: 'Poster Image (Optional)', type: 'image' },
          { name: 'title', label: 'Video Title (Optional)', type: 'text' }
        ]
      }
    ],
    defaultConfig: {
      heading: 'Featured Videos',
      layout: 'single',
      autoplay: false,
      loop: true,
      controls: true,
      videos: []
    }
  },
  SplideSliderModule: {
    type: 'SplideSliderModule',
    label: 'Splide Image Carousel',
    description: 'A customizable banner slider / image carousel with optional call-to-action details.',
    fields: [
      { name: 'heading', label: 'Section Heading', type: 'text', defaultValue: 'Featured Highlights' },
      { name: 'subheading', label: 'Section Subheading', type: 'textarea', defaultValue: 'Swipe to see some of our key agency features' },
      { name: 'type', label: 'Transition Type', type: 'select', defaultValue: 'loop', options: [{label: 'Infinite Loop', value: 'loop'}, {label: 'Slide', value: 'slide'}, {label: 'Fade Effect', value: 'fade'}] },
      { name: 'autoplay', label: 'Autoplay Enabled', type: 'boolean', defaultValue: true },
      { name: 'interval', label: 'Autoplay Speed (ms)', type: 'text', defaultValue: '5000' },
      { name: 'speed', label: 'Slide Transition Speed (ms)', type: 'text', defaultValue: '800' },
      { name: 'arrows', label: 'Show Nav Arrows', type: 'boolean', defaultValue: true },
      { name: 'pagination', label: 'Show Pagination Dots', type: 'boolean', defaultValue: true },
      { name: 'height', label: 'Slider Height (e.g. 500px, 70vh)', type: 'text', defaultValue: '500px' },
      {
        name: 'items',
        label: 'Slides',
        type: 'list',
        itemFields: [
          { name: 'image', label: 'Slide Image', type: 'image' },
          { name: 'title', label: 'Slide Title', type: 'text' },
          { name: 'description', label: 'Slide Description', type: 'textarea' },
          { name: 'buttonText', label: 'Button Text (Optional)', type: 'text' },
          { name: 'buttonUrl', label: 'Button Link (Optional)', type: 'text' }
        ]
      }
    ],
    defaultConfig: {
      heading: 'Featured Highlights',
      subheading: 'Swipe to see some of our key agency features',
      type: 'loop',
      autoplay: true,
      interval: '5000',
      speed: '800',
      arrows: true,
      pagination: true,
      height: '500px',
      items: [
        { image: '', title: 'Scale Your Business', description: 'We design top-tier products to boost your operations.', buttonText: 'Explore More', buttonUrl: '/services' },
        { image: '', title: 'Strategic Analytics', description: 'Make decisions based on accurate historical insights and real tracking data.', buttonText: 'Contact Us', buttonUrl: '/contact' }
      ]
    }
  },
  SplideLogoTickerModule: {
    type: 'SplideLogoTickerModule',
    label: 'Splide Logo Ticker',
    description: 'An infinite loop auto-scrolling ticker to display client or partner logos.',
    fields: [
      { name: 'heading', label: 'Section Heading (Optional)', type: 'text', defaultValue: 'Brands that trust us' },
      { name: 'speed', label: 'Scrolling Speed (Higher is faster)', type: 'text', defaultValue: '1' },
      { name: 'perPage', label: 'Visible Logos count', type: 'select', defaultValue: '5', options: [{label: '3 Logos', value: '3'}, {label: '4 Logos', value: '4'}, {label: '5 Logos', value: '5'}, {label: '6 Logos', value: '6'}, {label: '8 Logos', value: '8'}] },
      {
        name: 'logos',
        label: 'Logos list',
        type: 'list',
        itemFields: [
          { name: 'image', label: 'Logo Image', type: 'image' },
          { name: 'name', label: 'Company Name', type: 'text' }
        ]
      }
    ],
    defaultConfig: {
      heading: 'Brands that trust us',
      speed: '1',
      perPage: '5',
      logos: []
    }
  },
  SplideTestimonialsModule: {
    type: 'SplideTestimonialsModule',
    label: 'Splide Testimonial Slider',
    description: 'A swipable multi-card carousel showcasing client reviews and testimonials.',
    fields: [
      { name: 'heading', label: 'Section Heading', type: 'text', defaultValue: 'Client Success Stories' },
      { name: 'subheading', label: 'Section Subheading', type: 'textarea', defaultValue: 'Read what our clients say about our bespoke digital engineering services.' },
      { name: 'perPage', label: 'Cards visible at once', type: 'select', defaultValue: '3', options: [{label: '1 Card', value: '1'}, {label: '2 Cards', value: '2'}, {label: '3 Cards', value: '3'}, {label: '4 Cards', value: '4'}] },
      { name: 'autoplay', label: 'Autoplay Enabled', type: 'boolean', defaultValue: true },
      { name: 'interval', label: 'Autoplay Speed (ms)', type: 'text', defaultValue: '4000' },
      {
        name: 'items',
        label: 'Testimonials',
        type: 'list',
        itemFields: [
          { name: 'name', label: 'Client Name', type: 'text' },
          { name: 'company', label: 'Client Company', type: 'text' },
          { name: 'content', label: 'Review / Message', type: 'textarea' },
          { name: 'avatar', label: 'Avatar Image', type: 'image' },
          { name: 'rating', label: 'Rating (Stars)', type: 'select', defaultValue: '5', options: [{label: '5 Stars', value: '5'}, {label: '4 Stars', value: '4'}, {label: '3 Stars', value: '3'}] }
        ]
      }
    ],
    defaultConfig: {
      heading: 'Client Success Stories',
      subheading: 'Read what our clients say about our bespoke digital engineering services.',
      perPage: '3',
      autoplay: true,
      interval: '4000',
      items: [
        { name: 'Alex Johnson', company: 'Global Solutions', content: 'Antigravity CMS has completely transformed our publishing speeds. Highly recommend this team!', avatar: '', rating: '5' },
        { name: 'Sarah Miller', company: 'Alpha Design Agency', content: 'The dynamic visual builder and the video performance is state-of-the-art. Amazing UX.', avatar: '', rating: '5' },
        { name: 'David Lee', company: 'Nova Tech', content: 'Reliable, lightning-fast rendering and extremely high visual polish. Superb CMS modules.', avatar: '', rating: '5' }
      ]
    }
  },
  SplideGallerySyncModule: {
    type: 'SplideGallerySyncModule',
    label: 'Splide Synced Gallery',
    description: 'A synchronized dual-slider gallery (large main slide synchronized with thumbnails navigation below).',
    fields: [
      { name: 'heading', label: 'Section Heading', type: 'text', defaultValue: 'Bespoke Visual Gallery' },
      { name: 'height', label: 'Main Slide Height', type: 'text', defaultValue: '450px' },
      {
        name: 'items',
        label: 'Gallery Images',
        type: 'list',
        itemFields: [
          { name: 'image', label: 'Image', type: 'image' },
          { name: 'title', label: 'Caption Title (Optional)', type: 'text' },
          { name: 'description', label: 'Caption Description (Optional)', type: 'text' }
        ]
      }
    ],
    defaultConfig: {
      heading: 'Bespoke Visual Gallery',
      height: '450px',
      items: []
    }
  }
};
