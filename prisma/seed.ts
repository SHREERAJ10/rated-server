import {prisma} from "../db"

const USERS = [
  "07TaiBafVIa9Mahc83VNbPmzDti2",
  "7Y33UOopBvfcgDNGgy7hv2pJgwj1",
  "6hdcSECq4ISIjG59xwEbQ0ASItJ3",
  "XSEAMB5H5JXKauHYr5sVsd6IuOD2",
  "Dh4WIgJdSbh2DqlnvGB0LedvSNn2",
];

const MAIN_USER = "mdhC12W81Qe1CtCyUdTyVSB3I4c2";

const captions = [
  "Beautiful evening today.",
  "Morning hike.",
  "Trying something new.",
  "Weekend vibes.",
  "Coffee first.",
  "Back to work.",
  "This place was amazing.",
  "Enjoying the weather.",
  "Can't believe this happened.",
  "Another productive day.",
  "Travel memories.",
  "Late night coding.",
  "Lunch was incredible.",
  "Nature never disappoints.",
  "Random photo dump.",
  "Quick update.",
  "Had lots of fun today.",
  "Worth sharing.",
  "Sunsets hit differently.",
  "Small wins."
];

const comments = [
  "Nice!",
  "Looks great.",
  "Amazing shot.",
  "Love this.",
  "Where is this?",
  "Awesome.",
  "So cool!",
  "🔥",
  "Beautiful.",
  "I agree.",
  "Fantastic!",
  "Very nice.",
  "Looks fun.",
  "Great picture.",
  "Love the vibe."
];

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

async function main() {
  // Optional cleanup
  await prisma.commentLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.like.deleteMany();
  await prisma.postMedia.deleteMany();
  await prisma.post.deleteMany();

  for (let i = 0; i < 20; i++) {
    const author =
      Math.random() < 0.6 ? MAIN_USER : pick(USERS);

    const post = await prisma.post.create({
      data: {
        authorId: author,
        caption: captions[i],
      },
    });

    // ---------------- Media ----------------
    const mediaCount = random(1, 4);

    await prisma.postMedia.createMany({
      data: Array.from({ length: mediaCount }).map((_, idx) => ({
        postId: post.id,
        mediaUrl: `https://picsum.photos/seed/${post.id}-${idx}/800/800`,
      })),
    });

    // ---------------- Likes ----------------
    const likeUsers = shuffle([MAIN_USER, ...USERS]);
    const likeCount = random(0, likeUsers.length);

    await prisma.like.createMany({
      data: likeUsers.slice(0, likeCount).map((userId) => ({
        postId: post.id,
        likedByUserId: userId,
        postLiked: true,
      })),
    });

    // ---------------- Ratings ----------------
    const ratingUsers = shuffle([MAIN_USER, ...USERS]);
    const ratingCount = random(1, ratingUsers.length);

    await prisma.rating.createMany({
      data: ratingUsers.slice(0, ratingCount).map((userId) => ({
        postId: post.id,
        ratedByUserId: userId,
        score: random(1, 10),
      })),
    });

    // ---------------- Comments ----------------
    const commentCount = random(0, 15);

    for (let j = 0; j < commentCount; j++) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          commentedByUserId:
            Math.random() < 0.5 ? MAIN_USER : pick(USERS),
          comment: pick(comments),
        },
      });
    }
  }

  console.log("✅ Seed completed");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });