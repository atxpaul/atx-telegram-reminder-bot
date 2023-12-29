import { Telegraf } from 'telegraf';
import schedule from 'node-schedule';
import Reminder from '../models/Reminder.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply(
        'Bienvenidx al ATX Reminder Bot 📅\n\n' +
            'Puedes usar los siguientes comandos:\n' +
            '/reminder [mensaje] [hora] - Configura un recordatorio. Ejemplo: /reminder Comprar leche 18:00\n' +
            'Después de enviar el comando, podrás elegir si el recordatorio es puntual, diario o semanal.\n\n' +
            'Si necesitas más ayuda, te va a tocar esperar, todo esto está en pruebas'
    );
});

bot.command('reminder', (ctx) => {
    const regex = /^(\/reminder\s+)(.+)\s+(\d{2}:\d{2})$/;
    const matches = ctx.message.text.match(regex);

    if (matches && matches.length === 4) {
        const message = matches[2];
        const time = matches[3];
        console.log(`Estableciendo recordatorio ${message}:${time}`);
        ctx.reply('¿Cómo quieres que sea el recordatorio? Elige una opción:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Puntual',
                            callback_data: `once:${message}:${time}`,
                        },
                    ],
                    [
                        {
                            text: 'Diario',
                            callback_data: `daily:${message}:${time}`,
                        },
                    ],
                    [
                        {
                            text: 'Semanal',
                            callback_data: `weekly:${message}:${time}`,
                        },
                    ],
                ],
            },
        });
        console.log(`Estableciendo recordatorio ${message}:${time}`);
    } else {
        ctx.reply('Formato incorrecto. Usa: /reminder [mensaje] [hora]');
    }
});

bot.action(/(once|daily|weekly):(.+):(\d{2}:\d{2})/, async (ctx) => {
    console.log('Empezando');
    const [type, reminderText, time] = ctx.match.slice(1);

    let reminderData = {
        chatId: ctx.chat.id.toString(),
        message: reminderText,
        time,
        type,
    };
    console.log(reminderData);

    if (type === 'weekly') {
        // Aquí puedes pedir al usuario que seleccione los días de la semana
    } else {
        const reminder = new Reminder(reminderData);
        await reminder.save();
        ctx.reply(`Recordatorio guardado: ${reminderText} a las ${time}`);
    }
});

export function startBot() {
    bot.launch();
    console.log('Bot started');

    schedule.scheduleJob('* * * * *', async () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = `${currentHour
            .toString()
            .padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

        const reminders = await Reminder.find();
        reminders.forEach((reminder) => {
            if (reminder.time === currentTime) {
                // Comprueba si el recordatorio debe enviarse hoy
                const sendToday =
                    reminder.type === 'daily' ||
                    (reminder.type === 'weekly' &&
                        reminder.days.includes(now.getDay())) ||
                    reminder.type === 'once';

                if (sendToday) {
                    bot.telegram.sendMessage(
                        reminder.chatId,
                        `Recordatorio: ${reminder.message}`
                    );
                    if (reminder.type === 'once') {
                        Reminder.deleteOne({ _id: reminder._id }).exec();
                    }
                }
            }
        });
    });
}
