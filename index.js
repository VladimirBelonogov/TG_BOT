import { Telegraf, session, Markup, Scenes, Composer } from "telegraf";
import { message } from "telegraf/filters";
import { writeFileSync, mkdirSync, existsSync} from 'node:fs';
import fetch from 'node-fetch';
import  sqlite3  from "sqlite3";
import 'dotenv/config';

const bot = new Telegraf(process.env.TOKEH);

const db = new sqlite3.Database('./users.db')

const createUser = (telegram_id) => {
    const sql = `INSERT INTO users (telegram_id, is_subscriber, letter) VALUES (?, ?, ?)`;
    let is_subscriber = false;
    let letter= '';

    db.run(sql, [telegram_id, is_subscriber, letter], function(err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        }
    })
}

const checkUser = (telegram_id, callback) => {
    const sql = `SELECT id FROM users WHERE telegram_id = ?`;

    db.get(sql, [telegram_id], (err, row) => {
        if (err) {
            console.error(err.message);
            callback(err, null);
        } else {
            if (row) {
                console.log('User found:', row.id);
                callback(null, true);
            } else {
                console.log('User not found');
                callback(null, false);
            }
        }
    });
}

function getAllUsers(callback) {
    const sql = `SELECT * FROM users`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            callback(err, null);
        } else {
            console.log('Users retrieved:', rows);
            callback(null, rows);
        }
    });
}

getAllUsers((err, users) => {
    if (err) {
    } else {
        console.log('All users:', users);
    }
});


function updateUser(telegram_id, is_subscriber, letter) {
    const sql = `UPDATE users SET is_subscriber = ?, letter = ? WHERE telegram_id = ?`;

    db.run(sql, [is_subscriber, letter, telegram_id], function(err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`Row(s) updated: ${this.changes}`);
        }
    });
}

bot.use(session())

bot.use((ctx,next) => {
    console.log('---------------------------------ИТЕРАЦИЯ-----------------------------------');
    console.log(ctx.chat.id);

    checkUser(ctx.chat.id, (err,exist) => {
        if (!exist) {
            createUser(ctx.chat.id)
        }
    })

    if(!ctx.session){
        ctx.session = {
            verifiedUsers:[],
            currentUser: '',
        }
    }
    return next()
})

function welcome (user) {
    return `Привет ${user}!

    Перед тем, как смотреть бесплатный урок по созданию продающих Reels подпишись на мой канал, так как я там делюсь мыслями о том, что сейчас работает в Reels и не только!
    
    Вернувшись в бот, ты можешь смело смотреть урок, который откроет тебе глаза на то, как создавать Reels и Shorts на миллионы просмотров и они наберут тебе аудиторию и приведут клиентов!
    
    Забирай урок ниже 👇`
}

const scene = new Scenes.BaseScene('welcome')

step1.on(message('text'),(ctx) => {
    ctx.reply('Это тупик')
})

scene.enter( async (ctx) => {
    ctx.session.currentUser = (ctx.message.from.first_name ?? ctx.message.from.last_name ?? ctx.message.from.username)
    await ctx.reply(welcome(ctx.session.currentUser));
    await ctx.reply(`Ты подписался на мою группу?`, Markup.inlineKeyboard(
        [
            Markup.button.callback('✅', 'registered'),
            Markup.button.callback('❌', 'notRegistered')
        ]
    ));
})

const stage = new Scenes.Stage([scene])

bot.use(stage.middleware())

bot.start( async (ctx) => {
    ctx.scene.enter('welcome')
})

scene.action ('registered', async (ctx) => {
    
    ctx.telegram.getChatMember('@gygvvfgghvv', ctx.chat.id)
    .then (async s => {
        if (s.status === 'member' || s.status === 'creator' ) {
            await ctx.replyWithHTML('<a href="https://www.youtube.com/watch?v=Jb-xbhtJCUs&ab_channel=ostashow">Крутой ролик по Reels</a>');
            updateUser(ctx.chat.id, true, '')
        } else {
            await ctx.replyWithHTML('Кажется, тебя нет среди подписчиков моего <a href="https://t.me/dnevnikreatora">Телеграм канала</a>')
            await ctx.reply(`Уже подписался?`, Markup.inlineKeyboard(
                [
                    Markup.button.callback('✅', 'registered'),
                ]
            ));
        }
    })
    
})

scene.action ('notRegistered', async (ctx) => {
    ctx.telegram.getChatMember('@gygvvfgghvv', ctx.chat.id)
    .then (async s => {
        if (s.status === 'member' || s.status === 'creator' ) {
            await ctx.replyWithHTML('<a href="https://www.youtube.com/watch?v=Jb-xbhtJCUs&ab_channel=ostashow">Крутой ролик по Reels</a>');
        } else {
            await ctx.replyWithHTML('Кажется, тебя нет среди подписчиков моего <a href="https://t.me/dnevnikreatora">Телеграм канала</a>')
            await ctx.reply(`Уже подписался?`, Markup.inlineKeyboard(
                [
                    Markup.button.callback('✅', 'registered'),
                ]
            ));
        }
    })
})

bot.launch()