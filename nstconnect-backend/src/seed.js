require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./utils/prisma');

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'IT', 'Chemical'];
const skills = [
    'JavaScript,React,Node.js',
    'Python,Django,Machine Learning',
    'Java,Spring Boot,Microservices',
    'C++,Data Structures,Algorithms',
    'React Native,Mobile Development,UI/UX',
    'DevOps,Docker,Kubernetes',
    'Data Science,Python,TensorFlow',
    'Full Stack,MERN,PostgreSQL'
];

const headlines = [
    'Passionate Software Developer | Open Source Contributor',
    'Full Stack Developer | Tech Enthusiast',
    'AI/ML Engineer | Research Enthusiast',
    'Mobile App Developer | React Native Expert',
    'Backend Developer | Cloud Architecture',
    'Frontend Developer | UI/UX Designer',
    'DevOps Engineer | Automation Specialist',
    'Data Scientist | Analytics Expert'
];

const bios = [
    'Love building scalable applications and contributing to open source. Always learning new technologies!',
    'Passionate about creating beautiful user experiences. Coffee lover ☕',
    'Machine Learning enthusiast working on exciting AI projects. Let\'s connect!',
    'Building mobile apps that make a difference. Tech blogger and speaker.',
    'Cloud architecture and microservices are my thing. Always up for tech discussions!',
    'Design-focused developer who loves clean code and pixel-perfect UIs.',
    'Automating everything! DevOps culture advocate and continuous learner.',
    'Turning data into insights. Python enthusiast and kaggle competitor.'
];

const postContents = [
    'Just finished an amazing project on machine learning! The results are incredible. #AI #MachineLearning',
    'Looking for collaborators on an open-source project I\'m working on. DM me if interested! 🚀',
    'Attended an awesome tech conference today. So many inspiring talks! #TechConf2024',
    'Finally deployed my app to production! Feeling accomplished 💪',
    'Who else is excited about the new React features? Game changer! ⚛️',
    'Coffee + Code = Perfect combo ☕💻 What\'s your coding fuel?',
    'Just got my AWS certification! Hard work pays off 🎉',
    'Working on a cool side project this weekend. Stay tuned! 🔥',
    'Best practices for API design - what are your thoughts? Let\'s discuss!',
    'Debugging is like being a detective in a crime movie where you are also the murderer 😅',
    'Excited to announce I\'ll be speaking at the upcoming tech meetup! See you there 🎤',
    'Just discovered this amazing library that solves a problem I\'ve been struggling with!',
    'Team collaboration makes everything better. Grateful for my amazing colleagues! 🙌',
    'Learning a new programming language this month. Any recommendations?',
    'The feeling when your code works on the first try... priceless! 😄'
];

const comments = [
    'Great work! Keep it up! 👏',
    'This is awesome! Can you share more details?',
    'Congratulations! Well deserved! 🎉',
    'I\'d love to collaborate on this!',
    'Very interesting perspective!',
    'Thanks for sharing this!',
    'This is exactly what I needed!',
    'Amazing! How did you do this?',
    'Inspiring! Keep sharing your journey!',
    'Would love to learn more about this!'
];

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.notification.deleteMany();
    await prisma.message.deleteMany();
    await prisma.groupMember.deleteMany();
    await prisma.group.deleteMany();
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.friend.deleteMany();
    await prisma.friendRequest.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [];
    const userNames = [
        { name: 'Rahul Sharma', email: 'rahul@nst.edu' },
        { name: 'Priya Patel', email: 'priya@nst.edu' },
        { name: 'Arjun Kumar', email: 'arjun@nst.edu' },
        { name: 'Sneha Reddy', email: 'sneha@nst.edu' },
        { name: 'Vikram Singh', email: 'vikram@nst.edu' },
        { name: 'Ananya Iyer', email: 'ananya@nst.edu' },
        { name: 'Rohan Gupta', email: 'rohan@nst.edu' },
        { name: 'Kavya Nair', email: 'kavya@nst.edu' },
        { name: 'Aditya Verma', email: 'aditya@nst.edu' },
        { name: 'Ishita Joshi', email: 'ishita@nst.edu' },
        { name: 'Karan Mehta', email: 'karan@nst.edu' },
        { name: 'Diya Shah', email: 'diya@nst.edu' },
        { name: 'Siddharth Rao', email: 'siddharth@nst.edu' },
        { name: 'Meera Desai', email: 'meera@nst.edu' },
        { name: 'Aarav Kapoor', email: 'aarav@nst.edu' }
    ];

    for (let i = 0; i < userNames.length; i++) {
        const user = await prisma.user.create({
            data: {
                name: userNames[i].name,
                email: userNames[i].email,
                password: hashedPassword,
                department: departments[i % departments.length],
                bio: bios[i % bios.length],
                headline: headlines[i % headlines.length],
                skills: skills[i % skills.length],
                graduationYear: 2024 + (i % 4),
                linkedinUrl: `https://linkedin.com/in/${userNames[i].name.toLowerCase().replace(' ', '-')}`,
                githubUrl: `https://github.com/${userNames[i].name.toLowerCase().replace(' ', '')}`
            }
        });
        users.push(user);
    }
    console.log(`✅ Created ${users.length} users`);

    // Create friend connections
    console.log('🤝 Creating friend connections...');
    let friendCount = 0;
    for (let i = 0; i < users.length; i++) {
        // Each user will be friends with 3-6 random other users
        const numFriends = 3 + Math.floor(Math.random() * 4);
        const friendIndices = new Set();

        while (friendIndices.size < numFriends) {
            const friendIndex = Math.floor(Math.random() * users.length);
            if (friendIndex !== i) {
                friendIndices.add(friendIndex);
            }
        }

        for (const friendIndex of friendIndices) {
            try {
                // Create bidirectional friendship
                await prisma.friend.create({
                    data: {
                        userId: users[i].id,
                        friendId: users[friendIndex].id
                    }
                });
                friendCount++;
            } catch (error) {
                // Skip if friendship already exists
            }
        }
    }
    console.log(`✅ Created ${friendCount} friend connections`);

    // Create posts
    console.log('📝 Creating posts...');
    const posts = [];
    for (let i = 0; i < 30; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const post = await prisma.post.create({
            data: {
                content: postContents[i % postContents.length],
                authorId: randomUser.id,
                createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
            }
        });
        posts.push(post);
    }
    console.log(`✅ Created ${posts.length} posts`);

    // Create comments
    console.log('💬 Creating comments...');
    let commentCount = 0;
    for (const post of posts) {
        const numComments = Math.floor(Math.random() * 5); // 0-4 comments per post
        for (let i = 0; i < numComments; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            await prisma.comment.create({
                data: {
                    content: comments[Math.floor(Math.random() * comments.length)],
                    postId: post.id,
                    authorId: randomUser.id
                }
            });
            commentCount++;
        }
    }
    console.log(`✅ Created ${commentCount} comments`);

    // Create likes
    console.log('❤️  Creating likes...');
    let likeCount = 0;
    for (const post of posts) {
        const numLikes = Math.floor(Math.random() * 8) + 1; // 1-8 likes per post
        const likedBy = new Set();

        while (likedBy.size < numLikes && likedBy.size < users.length) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            if (!likedBy.has(randomUser.id)) {
                try {
                    await prisma.like.create({
                        data: {
                            postId: post.id,
                            userId: randomUser.id
                        }
                    });
                    likedBy.add(randomUser.id);
                    likeCount++;
                } catch (error) {
                    // Skip if like already exists
                }
            }
        }
    }
    console.log(`✅ Created ${likeCount} likes`);

    // Create messages
    console.log('💌 Creating messages...');
    let messageCount = 0;
    for (let i = 0; i < 20; i++) {
        const sender = users[Math.floor(Math.random() * users.length)];
        let receiver = users[Math.floor(Math.random() * users.length)];

        // Ensure sender and receiver are different
        while (receiver.id === sender.id) {
            receiver = users[Math.floor(Math.random() * users.length)];
        }

        const messageTexts = [
            'Hey! How are you doing?',
            'Did you see the latest project updates?',
            'Want to grab coffee sometime?',
            'Thanks for your help yesterday!',
            'Let\'s collaborate on that project!',
            'Great presentation today!',
            'Can you share those notes?',
            'See you at the meetup!'
        ];

        await prisma.message.create({
            data: {
                senderId: sender.id,
                receiverId: receiver.id,
                content: messageTexts[Math.floor(Math.random() * messageTexts.length)],
                isRead: Math.random() > 0.5,
                createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
            }
        });
        messageCount++;
    }
    console.log(`✅ Created ${messageCount} messages`);

    // Create notifications
    console.log('🔔 Creating notifications...');
    let notificationCount = 0;
    for (let i = 0; i < 15; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const notificationTypes = ['LIKE', 'COMMENT', 'FRIEND_ACCEPTED'];
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

        const messages = {
            LIKE: 'Someone liked your post!',
            COMMENT: 'Someone commented on your post!',
            FRIEND_ACCEPTED: 'Your friend request was accepted!'
        };

        await prisma.notification.create({
            data: {
                userId: randomUser.id,
                type: type,
                message: messages[type],
                isRead: Math.random() > 0.6,
                createdAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000)
            }
        });
        notificationCount++;
    }
    console.log(`✅ Created ${notificationCount} notifications`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Friends: ${friendCount}`);
    console.log(`   Posts: ${posts.length}`);
    console.log(`   Comments: ${commentCount}`);
    console.log(`   Likes: ${likeCount}`);
    console.log(`   Messages: ${messageCount}`);
    console.log(`   Notifications: ${notificationCount}`);
    console.log('\n💡 You can login with any user using:');
    console.log('   Email: any user email (e.g., rahul@nst.edu)');
    console.log('   Password: password123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
