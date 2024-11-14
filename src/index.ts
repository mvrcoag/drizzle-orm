import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { UserInsert, usersTable, postsTable } from "./db/schema";
import { and, eq, or } from "drizzle-orm";
import * as schema from "./db/schema";

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  throw new Error("DATABASE_URL is required");
}

const db = drizzle(DB_URL, {
  schema,
});

async function main() {
  await db.delete(usersTable);

  const newUsers: UserInsert[] = [
    {
      age: 21,
      name: "Marco",
      email: "marco@gmail.com",
      phone: "3322114532",
    },
    {
      age: 31,
      name: "Antonio",
      email: "antonio@gmail.com",
      phone: "3322114533",
    },
  ];

  await db.insert(usersTable).values(newUsers);

  const usersAfterCreate = await db.select().from(usersTable);

  console.log("Users after create");
  console.table(usersAfterCreate);

  await db
    .update(usersTable)
    .set({
      age: 22,
    })
    .where(
      and(
        eq(usersTable.name, "Marco"),
        eq(usersTable.email, "marco@gmail.com"),
      ),
    );

  const usersAfterUpdate = await db.query.usersTable.findMany();

  console.log("Users after update");
  console.table(usersAfterUpdate);

  const findedUser = await db.query.usersTable.findFirst({
    where: (u, { eq }) => eq(u.email, "antonio@gmail.com"),
  });

  console.log("Finded user");
  console.table(findedUser);

  await db.delete(usersTable).where(eq(usersTable.email, "antonio@gmail.com"));

  const finalUsers = await db.query.usersTable.findMany();

  console.log("Final users");
  console.table(finalUsers);

  if (finalUsers.length === 0) return;

  const finalUser = finalUsers[0];

  await db.insert(postsTable).values({
    title: "Post 1",
    content: "Content 1",
    userId: finalUser.id,
  });

  const userWithPosts = await db.query.usersTable.findFirst({
    where: (u, { eq }) => eq(u.id, finalUser.id),
    with: {
      posts: true,
    },
  });

  console.log("User with posts");
  console.table(userWithPosts);
  console.table(userWithPosts?.posts);
}

main().catch(console.error);
