-- Insert fake user profiles for testing the discover feature
-- This creates diverse users with different personalities, interests, and dating preferences

INSERT INTO users (
  google_id, email, name, avatar_url,
  core_traits, potential_career_interests, dream_date_profile, 
  ideal_date, ideal_partner, unique_scoring_chart, 
  summary, core_personality_traits, interests
) VALUES 

-- Creative & Artistic Users
(
  'fake_user_001', 'emma.artist@example.com', 'Emma Chen', 
  'https://images.unsplash.com/photo-1494790108755-2616b612b1c6?w=150&h=150&fit=crop&crop=face',
  'Creative soul with a passion for visual storytelling. Loves exploring art galleries, trying new cafes, and discussing philosophy. Has a quirky sense of humor and appreciates authentic connections.',
  'Graphic design, art therapy, museum curation, freelance illustration',
  'The artistic dreamer who finds beauty in everyday moments. Loves deep conversations over coffee and spontaneous creative adventures.',
  'Gallery hopping followed by a cozy bookstore browse, then cooking a meal together while sharing stories about our favorite artists.',
  'Someone who appreciates creativity, has their own passions, and enjoys both deep conversations and comfortable silences. Bonus points for artistic appreciation.',
  'Creativity: 95%, Introversion: 70%, Adventure: 60%, Intellectual: 85%',
  'Emma is a creative professional who finds inspiration in art, literature, and meaningful conversations. She values authenticity and emotional intelligence.',
  'Thoughtful, creative, introspective, empathetic',
  'Art, photography, indie films, poetry, vintage shopping, coffee culture'
),

-- Tech & Gaming Enthusiast  
(
  'fake_user_002', 'alex.gamer@example.com', 'Alex Rodriguez',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'Tech-savvy gaming enthusiast with a love for problem-solving and innovation. Enjoys building PCs, playing competitive games, and staying up-to-date with the latest tech trends.',
  'Software development, game design, cybersecurity, tech startup founder',
  'The tech innovator who loves gaming marathons and building cool projects. Always down for trying new restaurants and exploring the city.',
  'Gaming session with takeout, followed by a walk around the city discovering new spots, maybe ending with stargazing and talking about future tech.',
  'Someone who shares my passion for technology or at least appreciates it. Loves gaming together, enjoys good food, and is open to geeky conversations.',
  'Tech Skills: 90%, Gaming: 95%, Social: 65%, Innovation: 88%',
  'Alex combines technical expertise with a playful spirit. He loves sharing his passions and learning about others.',
  'Logical, passionate, curious, loyal',
  'Gaming, programming, sci-fi movies, anime, tech gadgets, esports'
),

-- Outdoor Adventure Lover
(
  'fake_user_003', 'maya.hiker@example.com', 'Maya Thompson',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'Adventurous spirit who finds peace in nature. Loves hiking, rock climbing, and capturing beautiful landscapes. Values environmental conservation and sustainable living.',
  'Environmental science, outdoor education, travel blogging, park ranger',
  'The nature lover who seeks adventure and tranquility in equal measure. Loves sharing outdoor experiences and environmental awareness.',
  'Sunrise hike to a beautiful viewpoint, picnic lunch with homemade treats, followed by exploring a new trail and ending with a campfire under stars.',
  'Someone who loves the outdoors, appreciates nature, and is up for adventures. Environmentally conscious and enjoys staying active together.',
  'Adventure: 95%, Fitness: 90%, Environmental: 85%, Independence: 80%',
  'Maya lives for outdoor adventures and environmental conservation. She brings energy and positivity to everything she does.',
  'Adventurous, energetic, environmentally-conscious, optimistic',
  'Hiking, rock climbing, photography, camping, environmental activism, yoga'
),

-- Music & Arts Scene
(
  'fake_user_004', 'jordan.music@example.com', 'Jordan Kim',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'Music producer and vinyl collector with an eclectic taste spanning jazz to electronic. Enjoys live shows, music festivals, and collaborating with other artists.',
  'Music production, sound engineering, music journalism, concert promotion',
  'The music enthusiast who lives for live performances and discovering new sounds. Loves sharing musical experiences and creative collaborations.',
  'Check out a live jazz show, grab late-night tacos, then back to my studio to listen to rare vinyl records and maybe jam together.',
  'Someone who appreciates music, enjoys live performances, and is open to exploring different genres. Creative spirit preferred.',
  'Musical: 95%, Creative: 85%, Social: 75%, Cultural: 90%',
  'Jordan is deeply passionate about music and loves sharing that passion with others. They bring creativity and rhythm to relationships.',
  'Musical, creative, passionate, social',
  'Music production, vinyl collecting, live concerts, jazz, electronic music, music festivals'
),

-- Fitness & Wellness Focus
(
  'fake_user_005', 'sam.fitness@example.com', 'Sam Wilson',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'Fitness trainer and wellness coach who believes in balancing physical health with mental well-being. Enjoys teaching others and staying active.',
  'Personal training, sports therapy, wellness coaching, nutrition consulting',
  'The wellness warrior who motivates others to be their best selves. Loves active dates and healthy lifestyle choices.',
  'Morning workout together, healthy brunch, afternoon bike ride through the city, then yoga session and cooking a nutritious dinner.',
  'Someone who values health and fitness, enjoys staying active, and appreciates a balanced lifestyle. Motivation and positivity are key.',
  'Fitness: 95%, Health: 90%, Motivation: 88%, Balance: 80%',
  'Sam combines physical fitness with mental wellness, always encouraging others to reach their potential.',
  'Motivational, healthy, energetic, supportive',
  'Fitness training, yoga, nutrition, cycling, running, wellness coaching'
),

-- Intellectual & Academic
(
  'fake_user_006', 'dr.sarah@example.com', 'Dr. Sarah Martinez',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  'PhD in Psychology with a love for research and understanding human behavior. Enjoys reading, writing, and engaging in thoughtful discussions about society.',
  'Clinical psychology, research, academia, writing, consulting',
  'The intellectual who loves deep conversations and learning together. Values emotional intelligence and thoughtful communication.',
  'Visit a museum exhibition, followed by dinner at a quiet restaurant where we can talk for hours, then a bookstore browse and coffee.',
  'Someone who enjoys intellectual conversations, appreciates learning, and values emotional depth. Curiosity and thoughtfulness are attractive.',
  'Intelligence: 95%, Empathy: 90%, Curiosity: 88%, Communication: 85%',
  'Sarah brings depth and understanding to relationships, always interested in learning and growing together.',
  'Intellectual, empathetic, curious, thoughtful',
  'Psychology, research, reading, writing, museums, philosophy'
),

-- Culinary Artist
(
  'fake_user_007', 'chef.marco@example.com', 'Marco Giuseppe',
  'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
  'Professional chef who finds joy in creating memorable dining experiences. Loves exploring different cuisines, farmers markets, and cooking for loved ones.',
  'Culinary arts, restaurant management, food photography, cookbook writing',
  'The culinary artist who expresses love through food. Enjoys sharing cultural experiences and creating memorable meals together.',
  'Farmers market shopping in the morning, cooking a multi-course meal together, paired with good wine and stories about our culinary adventures.',
  'Someone who appreciates good food, enjoys trying new cuisines, and loves sharing meals together. Cultural curiosity is a plus.',
  'Culinary: 95%, Cultural: 85%, Hospitality: 90%, Creativity: 80%',
  'Marco creates connections through food and believes that sharing meals is one of life''s greatest pleasures.',
  'Culinary, hospitable, cultural, passionate',
  'Cooking, food photography, wine tasting, farmers markets, international cuisine, restaurant exploration'
),

-- Social Butterfly & Event Planner
(
  'fake_user_008', 'lisa.social@example.com', 'Lisa Chen',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
  'Event planner who loves bringing people together and creating magical experiences. Social butterfly with a talent for making everyone feel included.',
  'Event planning, marketing, public relations, hospitality management',
  'The social connector who loves planning fun experiences and meeting new people. Thrives in social settings and loves sharing adventures.',
  'Weekend market brunch with friends, afternoon at a pop-up event or festival, evening cocktails, and dancing at a trendy spot.',
  'Someone who enjoys social activities, likes meeting new people, and appreciates well-planned experiences. Outgoing personality preferred.',
  'Social: 95%, Planning: 90%, Energy: 88%, Networking: 85%',
  'Lisa brings energy and excitement to relationships, always planning the next fun adventure or social gathering.',
  'Social, energetic, organized, inclusive',
  'Event planning, parties, networking, dancing, cocktails, festivals'
),

-- Minimalist & Mindfulness
(
  'fake_user_009', 'zen.david@example.com', 'David Park',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
  'Minimalist lifestyle advocate who practices mindfulness and meditation. Enjoys simple pleasures, meaningful conversations, and sustainable living.',
  'Meditation instruction, sustainable design, minimalist consulting, mindfulness coaching',
  'The mindful minimalist who finds beauty in simplicity. Values presence, authenticity, and meaningful connections over material things.',
  'Meditation session together, simple home-cooked meal, walk in nature, and deep conversation about life and values.',
  'Someone who values mindfulness, appreciates simplicity, and seeks authentic connections. Interest in personal growth and sustainability.',
  'Mindfulness: 95%, Simplicity: 90%, Authenticity: 88%, Sustainability: 85%',
  'David brings calm and intentionality to relationships, focusing on what truly matters in life.',
  'Mindful, authentic, simple, peaceful',
  'Meditation, minimalism, sustainability, nature walks, mindful living, personal growth'
),

-- Creative Writer & Storyteller  
(
  'fake_user_010', 'anna.writer@example.com', 'Anna Kowalski',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'Freelance writer and storyteller who finds magic in everyday moments. Loves crafting narratives, exploring new places for inspiration, and deep conversations.',
  'Creative writing, journalism, copywriting, publishing, storytelling workshops',
  'The wordsmith who sees stories everywhere. Loves sharing adventures and finding inspiration in unexpected places.',
  'Explore a new neighborhood, visit quirky shops and cafes, collect interesting stories, then find a cozy spot to share our discoveries over wine.',
  'Someone who appreciates creativity, enjoys exploring new places, and loves sharing stories and experiences. Curiosity and imagination valued.',
  'Creativity: 90%, Storytelling: 95%, Exploration: 85%, Imagination: 88%',
  'Anna brings narrative and wonder to relationships, always finding new stories to share and experiences to explore.',
  'Creative, imaginative, curious, expressive',
  'Writing, storytelling, exploring new places, reading, creative workshops, journaling'
),

-- Business & Entrepreneurship
(
  'fake_user_011', 'ryan.startup@example.com', 'Ryan Foster',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
  'Entrepreneur and startup enthusiast who loves building innovative solutions. Passionate about business strategy, networking, and creating positive impact.',
  'Startup founder, business consulting, venture capital, innovation management',
  'The ambitious innovator who loves turning ideas into reality. Enjoys networking events and strategic thinking sessions.',
  'Business conference or networking event, followed by dinner to discuss ideas and goals, then drinks while brainstorming future projects.',
  'Someone who is ambitious, enjoys discussing business ideas, and appreciates innovation. Goal-oriented and driven personality preferred.',
  'Ambition: 90%, Innovation: 88%, Leadership: 85%, Networking: 87%',
  'Ryan brings drive and strategic thinking to relationships, always looking for ways to grow and improve together.',
  'Ambitious, innovative, strategic, driven',
  'Entrepreneurship, networking, business strategy, innovation, startups, investing'
),

-- Travel & Cultural Explorer
(
  'fake_user_012', 'sofia.travel@example.com', 'Sofia Rodriguez',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
  'Travel blogger and cultural enthusiast who has visited 30+ countries. Loves learning languages, trying authentic cuisines, and sharing travel stories.',
  'Travel blogging, cultural consulting, language instruction, tourism development',
  'The world explorer who brings global perspectives and cultural insights. Loves planning adventures and sharing travel experiences.',
  'Explore ethnic neighborhoods, try authentic cuisine, visit cultural centers, then plan our next travel adventure over coffee.',
  'Someone who loves travel, appreciates different cultures, and enjoys adventure. Open-mindedness and curiosity about the world.',
  'Travel: 95%, Cultural: 90%, Adventure: 85%, Languages: 80%',
  'Sofia brings worldly perspective and cultural richness to relationships, always ready for the next adventure.',
  'Worldly, cultural, adventurous, open-minded',
  'Travel, languages, cultural exploration, food tourism, photography, adventure planning'
);

-- Add a few more diverse profiles for better testing

INSERT INTO users (
  google_id, email, name, avatar_url,
  core_traits, potential_career_interests, dream_date_profile, 
  ideal_date, ideal_partner, unique_scoring_chart, 
  summary, core_personality_traits, interests
) VALUES 

-- Sports Enthusiast
(
  'fake_user_013', 'mike.sports@example.com', 'Mike Johnson',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
  'Former college athlete turned sports analyst. Loves watching games, playing recreational sports, and staying competitive in all aspects of life.',
  'Sports journalism, athletic coaching, sports management, fitness consulting',
  'The competitive athlete who brings team spirit to everything. Loves active dates and sharing sports passion.',
  'Watch the big game at a sports bar, play some basketball or tennis, grab dinner, and maybe catch a late movie.',
  'Someone who enjoys sports, appreciates competition, and likes staying active. Team player mentality preferred.',
  'Sports: 95%, Competition: 90%, Team Spirit: 85%, Activity: 88%',
  'Mike brings competitive spirit and team mentality to relationships, always encouraging mutual growth.',
  'Competitive, loyal, energetic, team-oriented',
  'Basketball, football, tennis, sports analysis, fitness, team sports'
),

-- Bookworm & Literature Lover
(
  'fake_user_014', 'emily.books@example.com', 'Emily Watson',
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
  'Librarian and literature enthusiast who finds solace in books and storytelling. Enjoys quiet coffee shops, book clubs, and literary discussions.',
  'Library science, literature teaching, publishing, literary criticism',
  'The literary soul who finds adventure in books and comfort in quiet moments. Loves sharing favorite stories and discoveries.',
  'Browse a bookstore together, find a cozy cafe to discuss our current reads, maybe attend a poetry reading or book launch.',
  'Someone who appreciates literature, enjoys quiet activities, and values deep conversations. Love of reading is essential.',
  'Literary: 95%, Intellectual: 88%, Calm: 85%, Thoughtful: 90%',
  'Emily brings depth and literary perspective to relationships, finding beauty in words and quiet moments.',
  'Literary, thoughtful, calm, intellectual',
  'Reading, writing, poetry, book clubs, libraries, literary events'
),

-- Comedy & Entertainment
(
  'fake_user_015', 'carlos.comedy@example.com', 'Carlos Mendez',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
  'Stand-up comedian and entertainment enthusiast who loves making people laugh. Enjoys comedy shows, improv, and finding humor in everyday life.',
  'Stand-up comedy, entertainment writing, comedy production, improv coaching',
  'The comedian who brings laughter and joy wherever he goes. Loves entertaining others and finding humor in life.',
  'Comedy show (maybe mine!), late dinner with lots of laughs, then perhaps karaoke or improv games to keep the fun going.',
  'Someone who appreciates humor, enjoys entertainment, and doesn''t take life too seriously. Laughter is the best medicine!',
  'Humor: 95%, Entertainment: 90%, Social: 85%, Creativity: 80%',
  'Carlos brings laughter and lightness to relationships, always finding ways to make life more enjoyable.',
  'Humorous, entertaining, social, creative',
  'Stand-up comedy, improv, entertainment, comedy writing, performing, making people laugh'
);

-- Note: You can run this SQL in your Supabase dashboard or via the API
-- These profiles provide diverse personalities for testing the compatibility scoring algorithm