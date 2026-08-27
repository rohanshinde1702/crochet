const blogsData = [
  {
    id: 1,
    slug: "ultimate-guide-to-choosing-the-perfect-yarn",
    category: "Yarn 101",
    title: "The Ultimate Guide to Choosing the Perfect Yarn for Every Crochet Project",
    readTime: "6 min read",
    readMinutes: 6,
    date: "Aug 18, 2026",
    isoDate: "2026-08-18",
    featured: true,
    author: {
      name: "Aanya Verma",
      role: "Lead Artisan & Founder",
      avatar: "/uploads/others/maker.png"
    },
    img: "/uploads/blogs/blog_yarn_selection_1787376883256.jpg",
    excerpt: "From breathable combed cotton to ultra-plush velvet chenille and merino wool, learn how yarn fiber, weight, and ply transform your handcrafted creations.",
    tags: ["Yarn 101", "Beginners", "Cotton Yarn", "Eco-Friendly"],
    likesCount: 142,
    commentsCount: 19,
    content: [
      {
        type: "paragraph",
        text: "Stepping into a yarn studio or browsing through endless skeins online can be wonderfully overwhelming. The delicate sheen of mercerized cotton, the cloud-like squish of chenille, and the rustic warmth of spun merino each tell a unique tactile story. Choosing the right yarn is not merely about color—it is the very soul of your crochet project."
      },
      {
        type: "quote",
        text: "A project's longevity, drape, and texture are decided in the first stitch of yarn choice. Treat your yarn selection like picking the finest fabric for couture."
      },
      {
        type: "heading",
        text: "1. Understanding Fiber Types: Cotton, Wool & Blends"
      },
      {
        type: "paragraph",
        text: "For summer pieces, baby items, and sturdy home decor like table mats or hanging planters, 100% combed cotton is unmatched. It delivers crisp stitch definition, zero pilling, and hypoallergenic comfort. If you are crafting plushies or winter blankets, velvet chenille and merino blends offer unmatched snug warmth and dreamy softness."
      },
      {
        type: "tip",
        title: "Artisan's Pro Tip",
        text: "When working with fluffy chenille or boucle yarn, place locking stitch markers every 10 stitches. The fuzzy halo can hide individual stitch loops easily!"
      },
      {
        type: "heading",
        text: "2. Decoding Yarn Weight & Hook Pairings"
      },
      {
        type: "paragraph",
        text: "Always check the yarn label for the recommended hook size, but don't hesitate to size down 0.5mm for amigurumi (to keep polyfill from peeking out) or size up 1mm for lightweight airy shawls and breezy summer wearables."
      }
    ],
    comments: [
      {
        id: 101,
        name: "Meera Patel",
        date: "Aug 19, 2026",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Meera",
        text: "This guide saved my blanket project! I was using the wrong hook for my cotton blend. Thank you for such clear advice."
      },
      {
        id: 102,
        name: "Karan Singhania",
        date: "Aug 20, 2026",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Karan",
        text: "The tip on sizing down for plushies made all the difference in my amigurumi bunny!"
      }
    ]
  },
  {
    id: 2,
    slug: "step-by-step-amigurumi-magic-circle-and-tension",
    category: "Crochet Guides",
    title: "Mastering Amigurumi: Perfect Tension, Clean Decreases & The Magic Ring",
    readTime: "8 min read",
    readMinutes: 8,
    date: "Aug 14, 2026",
    isoDate: "2026-08-14",
    featured: false,
    author: {
      name: "Rhea Sharma",
      role: "Plushie Design Specialist",
      avatar: "/uploads/others/ourStory.png"
    },
    img: "/uploads/blogs/blog_amigurumi_making_1787376901909.jpg",
    excerpt: "Unlock the secrets of adorable handmade plushies! Discover how to weave seamless invisible decreases, secure safety eyes, and master the magic circle.",
    tags: ["Amigurumi", "Crochet Guides", "Beginners", "Gift Ideas"],
    likesCount: 189,
    commentsCount: 24,
    content: [
      {
        type: "paragraph",
        text: "Amigurumi brings yarn to life with personality and warmth. But every crocheter remembers the initial struggle: loose stitches letting white stuffing show through, uneven ears, or an unraveling magic circle. With these refined techniques, your plushies will look polished and studio-crafted."
      },
      {
        type: "heading",
        text: "The Invisible Decrease (InvDec) Technique"
      },
      {
        type: "paragraph",
        text: "Instead of doing a standard single crochet decrease, insert your hook into only the front loops of the next two stitches, yarn over, pull through both front loops, yarn over and pull through remaining two loops. It leaves no gap, no bump, and blends seamlessly with single crochet stitches."
      },
      {
        type: "quote",
        text: "Consistency over speed. In amigurumi, regular gentle tension prevents hand strain and ensures each limb matches symmetrically."
      },
      {
        type: "tip",
        title: "Safety First for Baby Toys",
        text: "If making plush toys for toddlers under 3 years old, replace plastic safety eyes with embroidered french knots or crochet felt circles for maximum child safety."
      }
    ],
    comments: [
      {
        id: 201,
        name: "Sneha Reddy",
        date: "Aug 15, 2026",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha",
        text: "The invisible decrease technique is pure magic! My toys look so much cleaner now."
      }
    ]
  },
  {
    id: 3,
    slug: "how-to-wash-and-care-for-handmade-crochet-items",
    category: "Care & Tips",
    title: "How to Wash, Dry & Preserve Your Handmade Crochet Treasures Forever",
    readTime: "5 min read",
    readMinutes: 5,
    date: "Aug 10, 2026",
    isoDate: "2026-08-10",
    featured: false,
    author: {
      name: "Pooja Deshmukh",
      role: "Textile Conservator",
      avatar: "/uploads/others/madeByHand.png"
    },
    img: "/uploads/blogs/blog_crochet_care_1787376919974.jpg",
    excerpt: "Protect the shape, softness, and vibrant hues of your crochet blankets, wearables, and decor with our gentle artisan-approved care rituals.",
    tags: ["Wash & Care", "Care & Tips", "Slow Living", "Home Decor"],
    likesCount: 118,
    commentsCount: 14,
    content: [
      {
        type: "paragraph",
        text: "Handmade crochet items carry hours of dedication, warmth, and love. Unlike factory-spun synthetic fast fashion, artisan crochet requires mindful maintenance to retain its elasticity, stitch definition, and vibrant botanical tones across generations."
      },
      {
        type: "heading",
        text: "1. The Gentle Soak Ritual"
      },
      {
        type: "paragraph",
        text: "Fill a clean washbasin with lukewarm or cool water. Add a dime-sized amount of pH-neutral wool wash or gentle baby shampoo. Submerge your crochet piece and gently massage without wringing, twisting, or stretching the stitches."
      },
      {
        type: "tip",
        title: "Never Hang Wet Crochet",
        text: "Wet yarn carries heavy water weight that stretches delicate stitches out of shape. Always roll your wet piece inside a dry towel to press out moisture, then block it flat on a mesh drying rack."
      }
    ],
    comments: [
      {
        id: 301,
        name: "Ananya Roy",
        date: "Aug 11, 2026",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ananya",
        text: "I used to machine wash my crochet and ruined a cardigan once. This guide should come with every handmade purchase!"
      }
    ]
  },
  {
    id: 4,
    slug: "why-crochet-is-the-ultimate-slow-living-mindfulness-ritual",
    category: "Behind The Stitches",
    title: "The Art of Mindful Stitches: Why Crochet is the Antidote to Digital Burnout",
    readTime: "7 min read",
    readMinutes: 7,
    date: "Aug 06, 2026",
    isoDate: "2026-08-06",
    featured: false,
    author: {
      name: "Aanya Verma",
      role: "Lead Artisan & Founder",
      avatar: "/uploads/others/maker.png"
    },
    img: "/uploads/blogs/blog_hero_banner_1787376863197.jpg",
    excerpt: "In a world of constant notifications and screens, the rhythmic cadence of loop, yarn-over, and pull offers a sanctuary of peace, grounding, and slow living.",
    tags: ["Behind The Stitches", "Slow Living", "Cozy Living"],
    likesCount: 230,
    commentsCount: 31,
    content: [
      {
        type: "paragraph",
        text: "Neuroscientists and mindfulness practitioners have long noted the calming rhythm of repetitive fiber crafts. With every loop, your mind shifts from fight-or-flight reactivity into a tranquil flow state. There is a deep, primal satisfaction in transforming a single strand of yarn into a tactile object of beauty and function."
      },
      {
        type: "quote",
        text: "In every stitch, we weave a moment of patience. In every finished piece, we preserve a memory of peaceful focus."
      },
      {
        type: "heading",
        text: "Creating Your Cozy Daily Crafting Space"
      },
      {
        type: "paragraph",
        text: "Set up a designated corner with natural sunlight, a warm cup of herbal tea, ergonomic bamboo hooks, and soft ambient tunes. Even 20 minutes of evening crocheting signals your nervous system to unwind and promotes restful sleep."
      }
    ],
    comments: [
      {
        id: 401,
        name: "Ritu Nambiar",
        date: "Aug 07, 2026",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ritu",
        text: "Crocheting during my evening tea break has lowered my stress levels completely. Beautifully written article!"
      }
    ]
  },
  {
    id: 5,
    slug: "modern-granny-square-patterns-decor-ideas",
    category: "Patterns & Inspo",
    title: "Modern Granny Squares: 7 Contemporary Color Palettes & Decor Ideas",
    readTime: "6 min read",
    readMinutes: 6,
    date: "Jul 30, 2026",
    isoDate: "2026-07-30",
    featured: false,
    author: {
      name: "Tara Nair",
      role: "Color & Pattern Stylist",
      avatar: "/uploads/others/contact_flowers.jpg"
    },
    img: "/uploads/products/decor/category-1.png",
    excerpt: "Move over vintage stereotypes! Explore modern pastel palettes, earthy terracotta tones, and chic ways to style granny squares in contemporary homes.",
    tags: ["Granny Squares", "Patterns & Inspo", "Color Palettes", "Home Decor"],
    likesCount: 167,
    commentsCount: 18,
    content: [
      {
        type: "paragraph",
        text: "The traditional granny square is experiencing a glorious global renaissance. By pairing minimalist botanical colors—think sage green, dusty rose, warm cream, and toasted almond—with geometric block layouts, this timeless motif turns into chic wall hangings, laptop sleeves, and boho couch throws."
      },
      {
        type: "heading",
        text: "Artisan Color Harmony Secrets"
      },
      {
        type: "paragraph",
        text: "When building a multi-color granny square project, keep one anchor neutral shade (like oatmeal, unbleached linen, or soft ecru) for the outer border of all squares. This binds varied vibrant centers into a cohesive, designer-grade tapestry."
      }
    ],
    comments: [
      {
        id: 501,
        name: "Sunita Joshi",
        date: "Aug 01, 2026",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sunita",
        text: "The neutral border trick makes my granny square tote look so sophisticated!"
      }
    ]
  },
  {
    id: 6,
    slug: "thoughtful-handmade-crochet-gifts-for-every-occasion",
    category: "Cozy Living",
    title: "Thoughtful & Heartfelt: 10 Handmade Crochet Gifts for Every Milestone",
    readTime: "5 min read",
    readMinutes: 5,
    date: "Jul 22, 2026",
    isoDate: "2026-07-22",
    featured: false,
    author: {
      name: "Rhea Sharma",
      role: "Plushie Design Specialist",
      avatar: "/uploads/others/ourStory.png"
    },
    img: "/uploads/products/decor/sunflower.png",
    excerpt: "Never-withering sunflower stems, custom initial keychains, and snug baby booties: meaningful handmade gift ideas that show genuine care and craftsmanship.",
    tags: ["Gift Ideas", "Cozy Living", "Decor & Gifts", "Beginners"],
    likesCount: 195,
    commentsCount: 22,
    content: [
      {
        type: "paragraph",
        text: "There is an unforgettable joy in receiving a gift that took hours of handcrafting rather than a barcode scan. Handmade crochet flowers bring everlasting bloom to hospital rooms, graduation desks, and wedding gift hampers without requiring water or maintenance."
      },
      {
        type: "tip",
        title: "Personal Touch Idea",
        text: "Spray a tiny drop of calming lavender or rose essential oil onto the wooden stem or cotton petal base for an intoxicating sensory unboxing experience."
      }
    ],
    comments: [
      {
        id: 601,
        name: "Vikram Malhotra",
        date: "Jul 24, 2026",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram",
        text: "Gifted the sunflower stem to my partner on our anniversary and she absolutely loved it!"
      }
    ]
  },
  {
    id: 7,
    slug: "eco-friendly-crochet-swapping-plastic-for-cotton",
    category: "Behind The Stitches",
    title: "Zero-Waste Living: 5 Everyday Plastic Items You Can Replace with Crochet",
    readTime: "6 min read",
    readMinutes: 6,
    date: "Jul 15, 2026",
    isoDate: "2026-07-15",
    featured: false,
    author: {
      name: "Pooja Deshmukh",
      role: "Textile Conservator",
      avatar: "/uploads/others/madeByHand.png"
    },
    img: "/uploads/products/home/category-1.png",
    excerpt: "Swap disposable paper towels, synthetic sponges, and plastic market bags for machine-washable organic cotton crochet alternatives that last for years.",
    tags: ["Eco-Friendly", "Behind The Stitches", "Home Decor", "Slow Living"],
    likesCount: 154,
    commentsCount: 15,
    content: [
      {
        type: "paragraph",
        text: "Cotton is naturally durable, absorbent, and fully biodegradable. By crocheting textured waffle dishcloths, reusable cotton face rounds, and sturdy French market tote bags, you cut down on single-use plastics while adding artisanal elegance to your kitchen and bathroom."
      }
    ],
    comments: [
      {
        id: 701,
        name: "Deepa Iyer",
        date: "Jul 16, 2026",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Deepa",
        text: "My crochet face pads have completely replaced cotton wipes in my skincare routine!"
      }
    ]
  },
  {
    id: 8,
    slug: "crochet-for-babies-safety-yarns-and-sensory-texture",
    category: "Crochet Guides",
    title: "Crocheting for Little Ones: Safety Guidelines, Hypoallergenic Fibers & Softness",
    readTime: "7 min read",
    readMinutes: 7,
    date: "Jul 08, 2026",
    isoDate: "2026-07-08",
    featured: false,
    author: {
      name: "Aanya Verma",
      role: "Lead Artisan & Founder",
      avatar: "/uploads/others/maker.png"
    },
    img: "/uploads/products/kids/category-1.png",
    excerpt: "Discover the best certified baby-safe yarns, secure seam construction, and breathable open-stitch patterns for infants and newborns.",
    tags: ["Beginners", "Crochet Guides", "Cotton Yarn", "Gift Ideas"],
    likesCount: 178,
    commentsCount: 20,
    content: [
      {
        type: "paragraph",
        text: "Baby skin is ultra-sensitive, meaning rough synthetic blends or shedding fibers can cause irritation. We recommend OEKO-TEX certified organic cotton or bamboo-silk blends that stay buttery soft even after multiple gentle washes."
      }
    ],
    comments: [
      {
        id: 801,
        name: "Neha Kapoor",
        date: "Jul 10, 2026",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Neha",
        text: "Essential advice for any expectant mother or grandma wanting to crochet baby blankets."
      }
    ]
  }
];

module.exports = blogsData;