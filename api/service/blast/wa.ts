import { Client, LocalAuth } from "whatsapp-web.js";

// @ts-ignore
import qrcode from "qrcode-terminal";

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "my-multi-device-bot", // bisa ubah per device
  }),
  puppeteer: { headless: true },
});

client.on("qr", (qr) => {
  console.log({ qr });
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("WhatsApp ready");

  const number = "6282288007705"; // nomor tanpa + (gunakan kode negara)
  const chatId = number + "@c.us";

  const isRegistered = await client.isRegisteredUser(chatId);

  if (isRegistered) {
    console.log(`${number} is a valid WhatsApp number.`);
  } else {
    console.log(`${number} is NOT a WhatsApp number.`);
  }

  client.destroy(); // close after check
});

client.initialize();

function createClient(clientId: string) {
  const client = new Client({
    authStrategy: new LocalAuth({ clientId }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    console.log(`[${clientId}] QR:`, qr);
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", async () => {
    console.log(`[${clientId}] Ready to send message`);

    // Ganti dengan nomor tujuan (WA format internasional, TANPA tanda +)
    const target = "6281234567890@c.us";
    await client.sendMessage(target, `Halo dari ${clientId}!`);
  });

  client.on("auth_failure", (msg) => {
    console.error(`[${clientId}] Auth failed`, msg);
  });

  client.initialize();

  return client;
}

async function hasChattedWith(client: Client, number: string) {
  try {
    const id = number.includes("@c.us") ? number : `${number}@c.us`;
    await client.getChatById(id);
    return true;
  } catch (e) {
    return false;
  }
}
