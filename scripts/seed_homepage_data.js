const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// High-quality Unsplash images for sports
const PLAYER_IMAGES = [
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1562088287-bde35a1ea917?q=80&w=600&auto=format&fit=crop'
];

const COACH_IMAGES = [
  'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=600&auto=format&fit=crop'
];

const AGENT_IMAGES = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=600&auto=format&fit=crop'
];

const ORG_IMAGES = [
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1486282424096-74346e680a6c?q=80&w=600&auto=format&fit=crop'
];

const NEWS_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1431324155629-1a6d0a11f472?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1556217477-d3252e741880?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=800&auto=format&fit=crop'
];

const HIGHLIGHT_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504305754058-2f08ccd89a0a?q=80&w=800&auto=format&fit=crop'
];

async function seed() {
  console.log('🚀 Starting CenterKick Homepage DB Seeding...');

  // 1. Get or Create Author User
  let authorId;
  const { data: existingAdmin } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (existingAdmin) {
    authorId = existingAdmin.id;
    console.log('Using existing admin user:', authorId);
  } else {
    const { data: firstUser } = await supabase.from('users').select('id').limit(1).single();
    if (firstUser) {
      authorId = firstUser.id;
      console.log('Using first user in table as author:', authorId);
    } else {
      const email = `admin.seed.${Date.now()}@centerkick.com`;
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password: 'PasswordSecure123',
        email_confirm: true,
        user_metadata: { full_name: 'Seed Administrator' }
      });
      if (createErr) {
        console.error('Failed to create seed admin user:', createErr);
        process.exit(1);
      }
      authorId = newUser.user.id;
      await supabase.from('users').update({ role: 'admin' }).eq('id', authorId);
      console.log('Created new admin user:', authorId);
    }
  }

  // 2. Seed Categories
  console.log('Seeding categories...');
  const categories = [
    { name: 'News', slug: 'news' },
    { name: 'Transfer Focus', slug: 'transfer-focus' },
    { name: 'Highlights', slug: 'highlights' }
  ];
  const categoryIds = {};
  for (const cat of categories) {
    const { data: catRecord } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', cat.slug)
      .limit(1);

    if (catRecord && catRecord.length > 0) {
      categoryIds[cat.slug] = catRecord[0].id;
    } else {
      const { data: insertedCat, error: catErr } = await supabase
        .from('blog_categories')
        .insert([cat])
        .select()
        .single();
      if (catErr) {
        console.error(`Failed to insert category ${cat.name}:`, catErr);
        throw catErr;
      }
      categoryIds[cat.slug] = insertedCat.id;
    }
  }
  console.log('Categories Mapped:', categoryIds);

  // 3. Seed Tag
  console.log('Seeding blog_tags...');
  let tagId;
  const { data: existingTag } = await supabase
    .from('blog_tags')
    .select('id')
    .eq('slug', 'highlights')
    .limit(1);

  if (existingTag && existingTag.length > 0) {
    tagId = existingTag[0].id;
  } else {
    const { data: insertedTag, error: tagErr } = await supabase
      .from('blog_tags')
      .insert([{ name: 'HighLights', slug: 'highlights' }])
      .select()
      .single();
    if (tagErr) {
      console.error('Failed to insert highlights tag:', tagErr);
      throw tagErr;
    }
    tagId = insertedTag.id;
  }
  console.log('Highlights tag ID:', tagId);

  // 4. Seed News Posts (12 posts minimum for news feed)
  console.log('Seeding news posts...');
  const newsPostsData = [
    {
      title: 'Victor Osimhen Eyes Dynamic Premier League Summer Move',
      slug: 'osimhen-premier-league-summer-move',
      excerpt: 'Nigeria superstar forward Victor Osimhen is reportedly linked with multiple top English clubs ahead of the transfer window.',
      content: 'A detailed look at Victor Osimhens statistics and prospective transfer destinations in the Premier League.',
      cover_image_url: NEWS_COVER_IMAGES[0],
      published_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      category_id: categoryIds['transfer-focus'],
      is_draft: false,
      type: 'news'
    },
    {
      title: 'Lagos Academy Cup Finals Set For Dynamic Weekend Climax',
      slug: 'lagos-academy-cup-finals-weekend',
      excerpt: 'The elite tournament wraps up this Sunday at the National Stadium as top youth academies battle for local supremacy.',
      content: 'Expected lineups, key players to watch, and historical matches heading into this massive clash.',
      cover_image_url: NEWS_COVER_IMAGES[1],
      published_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      category_id: categoryIds['news'],
      is_draft: false,
      type: 'news'
    },
    {
      title: 'How West African Academies Are Powering European Leagues',
      slug: 'west-african-academies-powering-europe',
      excerpt: 'From Right to Dream to Pepsi Academy, discover the structures producing the next generation of football icons.',
      content: 'Deep analytical report on academy funding, scouting pipelines, and transition logistics for youth players.',
      cover_image_url: NEWS_COVER_IMAGES[2],
      published_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      category_id: categoryIds['news'],
      is_draft: false,
      type: 'news'
    },
    {
      title: 'Super Eagles Secure Vital World Cup Qualification Victory',
      slug: 'super-eagles-secure-world-cup-qualification',
      excerpt: 'A tactical masterclass ensures maximum points in a tight encounter, placing them in pole position for qualification.',
      content: 'Match ratings, coach reactions, and upcoming fixtures analysis.',
      cover_image_url: NEWS_COVER_IMAGES[3],
      published_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      category_id: categoryIds['news'],
      is_draft: false,
      type: 'news'
    },
    {
      title: 'Rising Stars: Under-17 Talents Catching Scouts Eyeballs',
      slug: 'rising-stars-u17-scout-attention',
      excerpt: 'Highlighting 5 young prospects from the regional leagues who look ready for major professional trials.',
      content: 'Individual profiles, position maps, and scouting ratings.',
      cover_image_url: NEWS_COVER_IMAGES[4],
      published_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      category_id: categoryIds['news'],
      is_draft: false,
      type: 'news'
    },
    {
      title: 'Grassroots Development Key to Continental Success, Says CAF President',
      slug: 'grassroots-development-caf-president-speech',
      excerpt: 'New developmental funding announced to upgrade training pitches and support coaching registries across Africa.',
      content: 'Detailed summary of the executive funding plans and target centers.',
      cover_image_url: NEWS_COVER_IMAGES[5],
      published_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      category_id: categoryIds['news'],
      is_draft: false,
      type: 'news'
    },
    {
      title: 'Local League MD5: Lekki FC Triumphs in Thrilling Derby Match',
      slug: 'lekki-fc-triumphs-derby-md5',
      excerpt: 'A late header clinches a 2-1 victory over Surulere Warriors in front of a packed local crowd.',
      content: 'Relive the derby with minute-by-minute stats and tactical breakdowns.',
      cover_image_url: NEWS_COVER_IMAGES[6],
      published_at: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
      category_id: categoryIds['news'],
      is_draft: false,
      type: 'news'
    },
    {
      title: 'Tactical Breakdown: Modern 3-4-3 Systems in Youth Formations',
      slug: 'tactical-breakdown-343-youth-formations',
      excerpt: 'Analyzing how academies are developing tactically flexible players to meet European demands.',
      content: 'Positional analysis, transition diagrams, and coaching interviews.',
      cover_image_url: NEWS_COVER_IMAGES[7],
      published_at: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
      category_id: categoryIds['news'],
      is_draft: false,
      type: 'news'
    },
    {
      title: 'Top Midfielder Signs New Long-Term Academy Representation Deal',
      slug: 'midfielder-signs-academy-representation-deal',
      excerpt: 'CenterKicks platform facilitates major representation partnership with international agency.',
      content: 'Contract terms summary, statement from agent, and player career projections.',
      cover_image_url: NEWS_COVER_IMAGES[0],
      published_at: new Date(Date.now() - 1000 * 60 * 540).toISOString(),
      category_id: categoryIds['transfer-focus'],
      is_draft: false,
      type: 'news'
    },
    {
      title: 'Sports Analytics: Tracking Certified Player Metrics via GPS Vests',
      slug: 'sports-analytics-certified-metrics-gps',
      excerpt: 'How modern clubs use performance data to scout speed, work rate, and spatial efficiency.',
      content: 'A breakdown of GPS metrics and their integration with player profiles.',
      cover_image_url: NEWS_COVER_IMAGES[1],
      published_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
      category_id: categoryIds['news'],
      is_draft: false,
      type: 'news'
    }
  ];

  for (const post of newsPostsData) {
    const { data: existingPost } = await supabase
      .from('cms_posts')
      .select('id')
      .eq('slug', post.slug)
      .limit(1);

    if (!existingPost || existingPost.length === 0) {
      const { error: insErr } = await supabase
        .from('cms_posts')
        .insert([{ ...post, author_id: authorId }]);
      if (insErr) {
        console.error(`Failed to insert news post "${post.title}":`, insErr);
        throw insErr;
      }
    }
  }

  // 5. Seed Highlights Video Posts (6 posts with sample YouTube sports video embeds)
  console.log('Seeding highlights video posts...');
  
  const makeHighlightContent = (videoId, title, text) => `
<div class="space-y-6">
  <div class="aspect-video w-full rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 bg-black">
    <iframe class="w-full h-full" src="https://www.youtube.com/embed/${videoId}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>
  <p class="text-gray-700 leading-relaxed font-medium mt-4">
    ${text}
  </p>
</div>
`.trim();

  const highlightsData = [
    {
      title: 'Match Highlights: Lekki FC vs Surulere Warriors (2-1)',
      slug: 'highlights-lekki-fc-surulere-warriors-2-1',
      excerpt: 'Watch the best moments, including the game-winning header and fine goalkeeper saves from MD5.',
      content: makeHighlightContent('3TGDQ8_zZ24', 'Lekki FC vs Surulere Warriors Highlights', 'Watch the full recap of MD5 derby clash at Lagos Stadium. Lekki FC managed a spectacular late goal to secure all 3 points.'),
      cover_image_url: HIGHLIGHT_COVER_IMAGES[0],
      published_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      category_id: categoryIds['highlights'],
      is_draft: false,
      type: 'highlight'
    },
    {
      title: 'Striker Showreel: Petar Linkeds Sensational Hat-trick',
      slug: 'highlights-petar-linked-hat-trick-showreel',
      excerpt: 'Check out all three goals from our featured player in the recent championship match.',
      content: makeHighlightContent('E-0Ew_W1v2U', 'Petar Linked Hat-trick Showreel', 'A compilation of the elite finishing, off-the-ball movements, and technical excellence displayed in the championship clash.'),
      cover_image_url: HIGHLIGHT_COVER_IMAGES[1],
      published_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      category_id: categoryIds['highlights'],
      is_draft: false,
      type: 'highlight'
    },
    {
      title: 'Goalkeeper Class: Top 5 Diving Saves of the Month',
      slug: 'highlights-top-5-goalkeeper-saves-month',
      excerpt: 'A compilation of spectacular reflex saves from the Lagos Premier League matches.',
      content: makeHighlightContent('14d023fF7k4', 'Top Goalkeeper Saves of the Month', 'Analysis of goalkeeper positioning, agility, and diving techniques from the latest league fixtures.'),
      cover_image_url: HIGHLIGHT_COVER_IMAGES[2],
      published_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
      category_id: categoryIds['highlights'],
      is_draft: false,
      type: 'highlight'
    },
    {
      title: 'Playmaker Vision: Elite Assists & Through Balls Highlight',
      slug: 'highlights-playmaker-vision-assists-through-balls',
      excerpt: 'Masterclass pass highlights displaying tactical awareness and speed of execution.',
      content: makeHighlightContent('yT1m51_6j3A', 'Playmaker Vision: Elite Assists', 'Study the visual scanning, decision-making, and execution speeds of top midfielders.'),
      cover_image_url: HIGHLIGHT_COVER_IMAGES[3],
      published_at: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
      category_id: categoryIds['highlights'],
      is_draft: false,
      type: 'highlight'
    },
    {
      title: 'Lagos Cup Final: Penalty Shootout Highlights',
      slug: 'highlights-lagos-cup-final-penalty-shootout',
      excerpt: 'Relive the high-pressure spot-kicks that decided the championship title.',
      content: makeHighlightContent('2Rz_qY18wA0', 'Lagos Cup Final Shootout', 'Watch the penalty shootout drama under the stadium lights to crown this season champions.'),
      cover_image_url: HIGHLIGHT_COVER_IMAGES[4],
      published_at: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
      category_id: categoryIds['highlights'],
      is_draft: false,
      type: 'highlight'
    },
    {
      title: 'Defensive Walls: Best Tackles & Blocks of the Week',
      slug: 'highlights-best-tackles-blocks-week',
      excerpt: 'A review of the stellar defensive interventions keeping clean sheets intact.',
      content: makeHighlightContent('3D0tQpXy_8g', 'Defensive Walls: Best Tackles & Blocks', 'A masterclass compilation of slide tackles, interceptions, and blocking technique.'),
      cover_image_url: HIGHLIGHT_COVER_IMAGES[5],
      published_at: new Date(Date.now() - 1000 * 60 * 330).toISOString(),
      category_id: categoryIds['highlights'],
      is_draft: false,
      type: 'highlight'
    }
  ];

  for (const post of highlightsData) {
    const { data: existingPost } = await supabase
      .from('cms_posts')
      .select('id')
      .eq('slug', post.slug)
      .limit(1);

    let createdPostId;
    if (existingPost && existingPost.length > 0) {
      createdPostId = existingPost[0].id;
      // Update existing post
      const { error: updErr } = await supabase
        .from('cms_posts')
        .update({
          content: post.content,
          excerpt: post.excerpt,
          cover_image_url: post.cover_image_url
        })
        .eq('id', createdPostId);
      if (updErr) {
        console.error(`Failed to update highlight post "${post.title}":`, updErr);
      }
    } else {
      const { data: insertedPost, error: insErr } = await supabase
        .from('cms_posts')
        .insert([{ ...post, author_id: authorId }])
        .select()
        .single();
      if (insErr) {
        console.error(`Failed to insert highlight post "${post.title}":`, insErr);
        throw insErr;
      }
      createdPostId = insertedPost.id;
    }

    // Link highlight tag
    const { data: linkRecord } = await supabase
      .from('post_tags')
      .select('*')
      .eq('post_id', createdPostId)
      .eq('tag_id', tagId)
      .limit(1);

    if (!linkRecord || linkRecord.length === 0) {
      const { error: tagLinkErr } = await supabase
        .from('post_tags')
        .insert([{ post_id: createdPostId, tag_id: tagId }]);
      if (tagLinkErr) {
        console.error('Failed to link tag to post:', tagLinkErr);
        throw tagLinkErr;
      }
    }
  }

  // 6. Seed Profiles for each Role (Ensure at least 6 active profiles of each category exist)
  const roles = [
    { role: 'player', count: 6, names: ['Gbenga Daniel', 'Chuka Ndidi', 'Femi Aina', 'Tariq Mensah', 'Suleiman Toure', 'Junior Samuel'] },
    { role: 'coach', count: 6, names: ['Coach Emmanuel', 'Coach Abiodun', 'Coach Osei', 'Coach Diallo', 'Coach Traore', 'Coach Yusuf'] },
    { role: 'agent', count: 4, names: ['Agent Kola', 'Agent Kwesi', 'Agent Diop', 'Agent George'] },
    { role: 'scout', count: 2, names: ['Scout Nelson', 'Scout Tobi'] },
    { role: 'organization', count: 6, names: ['Pepsi Academy', 'Remo Stars Academy', 'Right to Dream', 'Kano Pillars Youth', 'Lekki United Academy', 'Lagos Athletics FC'] }
  ];

  console.log('Seeding profiles per role...');
  for (const roleObj of roles) {
    const queryRole = roleObj.role === 'scout' ? 'scout' : roleObj.role === 'agent' ? 'agent' : roleObj.role;
    
    // Check how many we already have
    const { data: existingProfiles, error: checkErr } = await supabase
      .from('profiles')
      .select('*, user:users!profiles_user_id_fkey!inner(role)')
      .eq('user.role', queryRole)
      .eq('status', 'active');

    if (checkErr) {
      console.error(`Error querying active profiles for role ${queryRole}:`, checkErr);
    }

    const currentCount = existingProfiles ? existingProfiles.length : 0;
    console.log(`Current active ${roleObj.role} count in DB: ${currentCount}`);

    if (currentCount < roleObj.count) {
      const needed = roleObj.count - currentCount;
      console.log(`Need to seed ${needed} new ${roleObj.role}(s)...`);

      for (let i = 0; i < needed; i++) {
        const name = roleObj.names[i % roleObj.names.length];
        const email = `${roleObj.role}.seed.${i}.${Date.now()}@centerkick.com`;
        
        // Create auth user
        const { data: userRecord, error: authErr } = await supabase.auth.admin.createUser({
          email,
          password: 'PasswordSecure123',
          email_confirm: true,
          user_metadata: { full_name: name }
        });

        if (authErr) {
          console.error(`Auth user creation failed for ${roleObj.role}:`, authErr);
          continue;
        }

        const userId = userRecord.user.id;

        // Set role in public.users
        const { error: roleUpdErr } = await supabase
          .from('users')
          .update({ role: queryRole })
          .eq('id', userId);
        if (roleUpdErr) {
          console.error(`Failed to update user role to ${queryRole}:`, roleUpdErr);
        }

        // Update profile
        let avatarUrl = '';
        if (roleObj.role === 'player') avatarUrl = PLAYER_IMAGES[i % PLAYER_IMAGES.length];
        if (roleObj.role === 'coach') avatarUrl = COACH_IMAGES[i % COACH_IMAGES.length];
        if (roleObj.role === 'agent' || roleObj.role === 'scout') avatarUrl = AGENT_IMAGES[i % AGENT_IMAGES.length];
        if (roleObj.role === 'organization') avatarUrl = ORG_IMAGES[i % ORG_IMAGES.length];

        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ') || 'Seed';

        const { error: profileUpdErr } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName,
            role: queryRole, // Direct role update
            country: 'Nigeria',
            position: roleObj.role === 'player' ? 'Striker' : roleObj.role === 'coach' ? 'UEFA Head Coach' : null,
            bio: `Verified profile for ${name} registered on CenterKick.`,
            status: 'active',
            avatar_url: avatarUrl
          })
          .eq('user_id', userId);

        if (profileUpdErr) {
          console.error(`Failed to update profile details:`, profileUpdErr);
        }
      }
    }
  }

  console.log('✅ Seeding process finished successfully!');
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
