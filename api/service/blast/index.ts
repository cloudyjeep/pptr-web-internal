import { initDatabase } from "./db";
import { Customer, User } from "./model";
import { faker } from "@faker-js/faker";
import { syncSpreadsheetToDatabase } from "./spreadsheet";
import path from "path";
import { Op } from "sequelize";
import { replaceTemplate } from "./formatter";

async function main() {
  console.log("BLAST APPS is running");
  await initDatabase();

  const customers = await syncSpreadsheetToDatabase(
    Customer,
    "code_customer",
    path.join(__dirname, "assets", "CustomerDetailsListingFix.xlsx")
  );

  const validUsers = (
    await Customer.findAll({
      where: {
        no_telp: { [Op.startsWith]: "+62" },
        [Op.or]: [
          { status_customer: { [Op.like]: "%aktif%" } },
          //   { status_customer: { [Op.like]: "%new connection%" } },
        ],
      },
    })
  )
    .map((v) => v.toJSON())
    .map((v) => {
      return replaceTemplate(
        `
Hai! {{name}} 👋

Mulai {{tanggal}}, Call Center kami pindah ke nomor baru:

📞 Nomor baru: {{nomor_baru}}

Nomor lama {{nomor_lama}} sudah tidak aktif.

Yuk simpan nomor baru ini untuk tetap terhubung dengan kami!

Terima Kasih 🙏

  `,
        {
          name: ["bold", v.branch_name],
          tanggal: ["boldItalic", "23 Juni 2025"],
          nomor_baru: ["codeBold", "0811 7607 775"],
          nomor_lama: ["strike", "0811 6901 500"],
        }
      );
    });

  validUsers.map((v) => console.log(v));
  console.log({ customers });
  console.log(validUsers.length);

  return;

  for (const key of Array(100)) {
    await generateFakeUser(5000);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await generateFakeUser(5000);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const count = await User.count({
    logging: false,
  });
  console.log(`Total users in database: ${count}`);
}
main();

async function generateFakeUser(size = 1000) {
  let start = Date.now();
  console.log("Creating " + size + " users...");

  for (const key of Array(size)) {
    const name = faker.person.firstName() + " " + faker.person.lastName();
    await User.create(
      {
        name,
        email:
          name.toLowerCase().replace(/\s+/g, ".") +
          "@" +
          faker.internet.domainName(),
      },
      {
        logging: false, // Disable logging for performance
      }
    );
  }

  console.log("Users created successfully!");
  let end = Date.now();
  console.log(`Time taken to create users: ${(end - start) / 1000} seconds`);
}
