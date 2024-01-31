import { Telegraf, session, Markup, Scenes, Composer, Telegram } from "telegraf";
import { message } from "telegraf/filters";
import { writeFileSync, mkdirSync, existsSync} from 'node:fs';
import fetch from 'node-fetch';
import  sqlite3  from "sqlite3";
import 'dotenv/config';
import { get } from "node:http";
import * as cron from "node-cron"

const bot = new Telegraf('6650174368:AAHgE37hq2sg8Zcy-UyiwpYAidHNhfTRLOk');

// const bot = new Telegraf(process.env.TOKEH);

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
                callback(null, true,row);
            } else {
                console.log('User not found');
                callback(null, false,row);
            }
        }
    });
}

async function getAllUsers(callback) {
    const sql = `SELECT * FROM users`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

async function updateLetter(telegram_id, letter,current_count) {
    const sql = `UPDATE users SET current_count = ?, letter = ?, last_letter_send = ? WHERE telegram_id = ?`;
    const poslednyaLetterSend = new Date();

    db.run(sql, [0, letter, poslednyaLetterSend, telegram_id], function(err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`Row(s) updated: ${this.change}`);
        }
    });
}

async function updateLetterPlusCount(telegram_id, letter,current_count) {
    const sql = `UPDATE users SET current_count = ?, letter = ?, last_letter_send = ? WHERE telegram_id = ?`;
    const poslednyaLetterSend = new Date();
    db.run(sql, [current_count, letter, poslednyaLetterSend, telegram_id], function(err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`Row(s) updated: ${this.change}`);
        }
    });
}

async function updateUser(telegram_id, is_subscriber, letter) {
    const sql = `UPDATE users SET is_subscriber = ?, letter = ? WHERE telegram_id = ?`;

    db.run(sql, [is_subscriber, letter, telegram_id], function(err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`Row(s) updated: ${this.change}`);
        }
    });
}

bot.use(session());
bot.use( async(ctx,next) => {
    if(!ctx.session){
        ctx.session = {
            users: [],
            state: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','Z2','Z3'],
            actualState: 0,
            currentStepToday: 0,
        }
    }

    checkUser(ctx.chat.id, (err,exist,user) => {
        if (!exist) {
            createUser(ctx.chat.id)
        } else if (user.is_subscriber === 1) {
            let currentLetter = user.letter;
            // let lastLetterSend = user.last_letter_send;
            ctx.session.actualState = ctx.session.state.findIndex((e) => { e === currentLetter}) + 1;
            
            if (ctx.session.actualState > 0){
                let currentCount = user.current_count;
                ctx.session.currentStepToday = currentCount;
            }
        } 
    })

    return next()
})

async function contentA (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "А" - Азбука Reels</strong>

В боте я расскажу тебе от "А до Я", что важно в создании качественных, набирающих просмотры Reels и YouTube Shorts в бесплатном формате.

У тебя есть возможность ускориться и запрыгнуть к нам на курс, для самостоятельного изучения, так же и можем в течение месяца прокачать твои навыки с командой и с обратной связью.
А сейчас мы начинаем наше изучение азбуки, где тебя будут ждать:

    ● <strong>БЕСПЛАТНЫЕ</strong> уроки от экспертов
    ● <strong>БЕСПЛАТНЫЕ</strong> гайды 
    ● <strong>БЕСПЛАТНЫЕ</strong> шаблоны сценариев

и еще очень много пользы!

А если ты готов получать всегда <strong>ВСЕ</strong> и <strong>СРАЗУ</strong>, залетай к нам на курс, группа стартует 5 февраля 👇
`;
let keyboard = Markup.inlineKeyboard(
    [
        [Markup.button.url('Лови информацию об "Азбуке Reels"', 'https://azbukareels.ru/')],
        [Markup.button.callback('Следующая буква', 'ShowLetter')],
    ]);
    
    if (tgBot === null) {
        return obj.replyWithHTML(text,{parse_mode: 'HTML',...keyboard});
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard}) 
        } catch (error) {
            console.log(error);
            
        }
    }
}

async function contentB (obj,tgBot = null,tgChatId = null){
let text = `<strong>Буква "Б" - Бл@дский монтаж</strong>

Чтобы облегчить жизнь скажу сразу - сложный монтаж не работает на массы людей.

На нашем опыте проще всего донести ценность своего продукта или создать вирусный видос - это простота. Потому что ей доверяют массы людей. Когда ты видишь что-то сильно сложно смонтированное, у тебя есть рушится порог доверия, потому что аудитория считывает уже это как "постановку" или "продажу"
        
При этом важно понимать кто ваша целевая аудитория, если это молодое поколение "Tik Tok" и "быстрых денег", то там явно придется давать в медиа им ту скорость "склеек кадров" и наложений в кадре, к которой они привыкли.
        
Если тебе интересно о чем мы говорим в модуле про "монтаж" - жми на кнопку "хочу заглянуть в Азбуку"
`
let keyboard = Markup.inlineKeyboard(
    [   
        [Markup.button.callback('Заглянуть в модуль "Монтаж"', 'additionalСontentB')],
    ])

let source = {source: './img/B.JPG'};
    if (tgBot === null) {
        return obj.replyWithPhoto(source, {caption: text, parse_mode: 'HTML', ...keyboard});
    } else {
        try {
            tgBot.sendPhoto(tgChatId,source,{caption: text, parse_mode: 'HTML', ...keyboard})
        } catch (error) {
            console.log(error);
        }
    }
}

async function contentC (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "В" - Внешний вид</strong>

Выбирая свой внешний вид, для записи своих экспертных Reels.

Зачастую, мы даже не задумываемся насчёт этого, но тут и кроется ошибка, особенно, если мы хотим продавать свой продукт или услугу через этот ролик.

Мы пригласили СТИЛИСТА для разбора основных ошибок при съёмок ваших видео. Хочешь увидеть бесплатный урок от стилиста?
`
    let keyboard = Markup.inlineKeyboard(
    [   
        [Markup.button.callback('Посмотреть разбор стилиста', 'additionalСontentC')],
    ])

    let source = {source: './img/C.JPG'};
        if (tgBot === null) {
            return obj.replyWithPhoto(source, {caption: text, parse_mode: 'HTML', ...keyboard});
        } else {
            try {
                tgBot.sendPhoto(tgChatId,source,{caption: text, parse_mode: 'HTML', ...keyboard})
            } catch (error) {
                console.log(error);
                
            }
        }
}

async function videoContentC (obj,tgBot = null,tgChatId = null){
    let text = `Разбор <a href="https://www.youtube.com/watch?v=8KZIQ5i7V58&ab_channel=ostashow">стилиста</a>`;
    let keyboard = Markup.inlineKeyboard(
        [   
            [Markup.button.url('Хочешь полный урок/разбор от стилиста?', 'https://azbukareels.ru/')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')]
        ]
    );
    
    if (tgBot === null) {
        return await obj.replyWithHTML(text,{parse_mode: 'HTML',...keyboard});
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
        }
    }
}

async function contentD (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "Г" - Голос в кадре</strong>

Думаю, каждый из вас понимает, что снимая видео надо научиться говорить с аудиторией "по-настоящему".

Хотя зачастую ты пересматриваешь свои видео и ты чувствуешь, что, по факту, ты тут разговариваешь "со стеной".

Как этого избежать? Как достичь результата в постановке своего голоса? Обо всем этом мы поговорим на онлайнах нашей "Азбуки Reels" + и PRO, ждём тебя

А как ты разговариваешь с аудиторией?`
let keyboard = Markup.inlineKeyboard(
    [
        [Markup.button.url('А как ты разговариваешь с аудиторией?', 'https://azbukareels.ru/')],
        [Markup.button.callback('Следующая буква', 'ShowLetter')],
    ]
)
    if (tgBot === null) {
        return obj.replyWithHTML(text,{parse_mode: 'HTML',...keyboard});
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
            
        }
    }
}

async function contentE (obj,tgBot = null,tgChatId = null){
let text = `<strong>Буква "Д" - Досматриваемость Reels</strong>

Ну, во-первых вы должны использовать профессиональные аккаунты для мониторинга ваших показателей в статистике.

Успешные Reels основаны не только на умении цеплять внимание, но и качественно удерживать внимание в просмотрах ваших роликов.

Посмотрите, на какой секунде обычно зрители уходят на каждом из ваших Reels. Почему они вообще перестают смотреть?

Все эти вопросы мы решаем на креативных штурмах и онлайн-разборах в Азбуке Reels
`
let keyboard = Markup.inlineKeyboard(
    [
        [Markup.button.url('Откройте статистику вашего Reels', 'https://azbukareels.ru/')],
        [Markup.button.callback('Следующая буква', 'ShowLetter')],
    ]
)
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
            
        }
    }
}

async function contentF (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "Е" - Есть желание</strong>

Если у вас <strong>нет желания снимать Reels</strong> и, в целом, любой другой видео контент - не делайте этого.

Люди не дураки, они чувствуют ваше сопротивление в кадре и смотреть на вас страдающего никому не захочется.

Помимо "Говорящей головы" вы можете создавать массу единиц контента для Reels и привлекать к себе внимание и клиентов.

- <i>Озвучка</i>
- <i>Сторитейлинг</i> через <i>аудиоботов</i>
- <i>Короткие видео с текстом под них</i>

и еще массу других форматов мы обсуждаем на моём курсе <strong>"Азбука Reels"</strong>.

Хочешь набирать просмотры и не упахиваться на съёмке таких видео? Залетай на курс, пока всё это еще актуально!
`
let keyboard = Markup.inlineKeyboard(
    [
        [Markup.button.url('Открою вам секрет', 'https://azbukareels.ru/')],
        [Markup.button.callback('Следующая буква', 'ShowLetter')],
    ]
)
let source = {source: './img/F.JPG'};
    if (tgBot === null) {
        return obj.replyWithPhoto(source, {caption: text, parse_mode: 'HTML', ...keyboard});
    } else {
        try {
            tgBot.sendPhoto(tgChatId,source,{caption: text, parse_mode: 'HTML', ...keyboard})
        } catch (error) {
            console.log(error);
            
        }
    }
    
}

async function contentG (obj,tgBot = null,tgChatId = null){
let text = `<strong>Буква "Ж" - Жизненно</strong>

В первую очередь мы люди, поэтому нам <strong>важно показывать себя настоящих</strong> в наших социальных сетях.


Жизненный контент может стать максимально виральным, если он зацепит какой-то <strong>социально-бытовой вопрос</strong> или же просто будет отображением какой-то <strong>ситуации из жизни</strong> людей.

А там где было много просмотров, там и доверие и подписки и , как следствие - продажи.

Вот 3 примера роликов, которые я создал по приколу, а они мне привели аудиторию в инстаграм и тик токе:

<a href="https://www.instagram.com/reel/CubuLjPohLk/?igsh=MXJkYW0xMHhjeWhjcQ](https://www.instagram.com/reel/CubuLjPohLk/?igsh=MXJkYW0xMHhjeWhjcQ">Instagram</a>
<a href="https://vt.tiktok.com/ZSNKgT8vs/">Tik Tok</a>
<a href="https://vt.tiktok.com/ZSNKp6ART/">Tik Tok</a>
`
let keyboard = Markup.inlineKeyboard(
    [
        [Markup.button.url('Мы же не роботы', 'https://azbukareels.ru/')],
        [Markup.button.callback('Следующая буква', 'ShowLetter')],
    ]
)
let source = {source: './img/G.jpeg'};
    if (tgBot === null) {
        return obj.replyWithPhoto(source, {caption: text, parse_mode: 'HTML', ...keyboard});
    } else {
        try {
            tgBot.sendPhoto(tgChatId,source,{caption: text, parse_mode: 'HTML', ...keyboard})
        } catch (error) {
            console.log(error);
            
        }
    }
}

async function contentH (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "З" - Зае*ался</strong>

Мы можем снимать рилсы десятками, а они не набирают просмотры и клиенты не приходят ко мне после стольких стараний.

Складываем ручки и говорим себе, что больше никогда этим заниматься не буду. Конечно, когда нет стратегии, когда нет фокуса действий, тогда и нет результата.

<strong>Почему так происходит?</strong>

В таком формате продвижение очень важен фактор стабильности и дисциплины. По моей личной теории. Если мы снимаем 20 качественных видео, то 1 ролик из числа всех, что мы выложим - будет бриллиантом, который начнет залетать в рекомендации, который принесет вам, допустим 1000 подписчиков. И тут самый главный фактор того, что нам нельзя сдавать позиции. И, возможно через еще 5-7 роликов следующий ролик теорией "снежный ком" наберет в десятки или сотни раз больше предыдущего "залетевшего" ролика и вы наберете 10 000 тысяч аудитории.

Да, при этом остальные 20-25 роликов могут не иметь такого эффекта и результат. Но они будут показателем вашей стабильности и желания достичь результатов, что алгоритмы социальных сетех умело распознают.

Я учу грамотному мышлению в создании качественного и вирального контента. Присоединяйся к нашей "Азбуке Reels" и сам убедись в результатах!
`
let keyboard = Markup.inlineKeyboard(
    [
        [Markup.button.url('Забирай Азбуку Reels', 'https://azbukareels.ru/')],
        [Markup.button.callback('Следующая буква', 'ShowLetter')],
    ]
)
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
            
        }
    }
}

async function contentI (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "И" - Идеи для видео</strong>

<strong>Какие ролики снимать, чтобы они залетали?</strong>

Самый главный совет, пожалуй - <strong>раскрывать боли и основные запросы вашей целевой аудитории</strong> в темах ваших видео.

То есть, если вы работаете в какой-то сфере или нише и у вас 100% есть самые "часто задаваемые вопросы". По всем эти вопросам вы обязаны отснять интересные ролики, желательно с интересными и вовлекащими сценариями, чтобы ролик завирусился.

Как сделать так, чтобы <strong>быстро найти темы</strong> для контента на миллионы просмотров?

    1.) Заходите на YouTube и вбиваете основные слова для вашей целевой аудитории.

    2.) Выбираешь в фильтре опцию "по количеству просмотров"

    3.) Выбираешь за последний месяц или год (чтобы было реально актуально)

И вуаля - у тебя срез тем, которые интересны людям и которые они смотрят больше всего.

А как строить правильные сценарий для своих видео с оригинальными темами - мы раскроем этот секрет, когда вы дойдете до буквы "С".

Обязательно выключи уведомления в боте, чтобы прое*ать букву "С" и не получить бесплатный сценарий 😉
`
let keyboard = Markup.inlineKeyboard(
    [
        [Markup.button.url('Забрать Азбуку Reels', 'https://azbukareels.ru/')],
        [Markup.button.callback('Следующая буква', 'ShowLetter')],
    ]
)
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
            
        }
    }
}

async function contentJ (obj,tgBot = null,tgChatId = null){

    let text = `<strong>Буква "К" Качели просмотров</strong>

Выкладываешь видео и не получаешь столько просмотров, сколько ожидаешь и расстраиваешься?

А потом когда-то выкладываешь ролик на который и надежды то не было, а он, падла, залетает на миллионы просмотров!

Эти качели в просмотрах напрямую влияют на твоё настроение, согласен?

Совет простой - <strong>перестань смотреть на цифры</strong> и тем более как-то на них реагировать (не, ну если ролик залетает в рекомендации, то безусловно стоит порадоваться и наградить себя).

Но вот быть более подготовленному к большим просмотрам у вас получится быть благодаря крутым идеям, сценариям и уверенной подаче материала.

А когда ролик вируситься - вообще лучше быть заряженным, чтобы продавать свои услуги и не просрать свою "неделю славы".

Как правильно подготовиться к ролику, который полетить в рекомендации - я рассказываю на курсе "Азбука Reels" в пакетах + и PRO.
`
let keyboard = Markup.inlineKeyboard(
    [
        [Markup.button.url('"Забрать Азбуку Reels"', 'https://azbukareels.ru/')],
        [Markup.button.callback('Следующая буква', 'ShowLetter')],
    ]
)
let source = {source: './img/J.PNG'};
    if (tgBot === null) {
        return obj.replyWithPhoto(source, {caption: text, parse_mode: 'HTML', ...keyboard});
    } else {
        try {
            tgBot.sendPhoto(tgChatId,source,{caption: text, parse_mode: 'HTML', ...keyboard})
        } catch (error) {
            console.log(error);
        }
    }
}

async function contentK (obj,tgBot = null,tgChatId = null){
let text = `<strong>Буква "Л" Лёгкость</strong>

Как говориться: "Камеру не нае*ёшь"

Ваша энергетика в кадре напрямую эквивалентна вашим просмотрам.
Если вы трясётесь от страха записи видео - это провал
Если вы боитесь записывать, потому что вас осудят - это провал
Если вы не хотите негативных обсуждений под ваши видео - это провал

Хочешь стать более уверенным в себе при записи видео? Хочешь делать реально крутые и интересные миллионам людей ролики?

Тебе подойдет пакет PRO "Азбука Reels" на нашем курсе по созданию коротких видео, где тебя научат, как расслабиться и начать "с кайфом" создавать полезный контент!
`
    let keyboard = Markup.inlineKeyboard(
        [
            [Markup.button.url('"Забрать Азбуку Reels"', 'https://azbukareels.ru/')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')],
        ]
    )
    let source = {source: './img/K.JPG'};
        if (tgBot === null) {
            return obj.replyWithPhoto(source, {caption: text, parse_mode: 'HTML', ...keyboard});
        } else {
            try {
                tgBot.sendPhoto(tgChatId,source,{caption: text, parse_mode: 'HTML', ...keyboard})
            } catch (error) {
                console.log(error);
                
            }
        }
}

async function contentL (obj,tgBot = null,tgChatId = null){
let text = `<strong>Буква "М" Мотивация</strong>

Попав на огромный образовательный проект по созданию Reels в качестве эксперта и рилсмейкера я осознал, что огромного количеству людей нужен качественный скилл в создании видео для соц сетей.

Вдохновившись ивентом на берегу средиземного моря в Бодруме, в окружении больших блогеров, мощных экспертов и Моргерштерна - я попросту пропитался их энергетикой и зарядом позитивной энергии, которая дала мне бешенную мотивацию начать создавать активно свой продукт!

Разрабатывал я его целых 4 месяца, потому что я гребанный перфекционист в душе, но я добрался до его релиза и сейчас передаю вам свои знания, которые копил целые годы, управляя продакшном по созданию контента и снимая экспертов из абсолютно разных ниш.

Заходя в "Азбуку Reels" вы получаете не просто "набор инструментов" для создания вашего СОБСТВЕННОГО ПРОДУКТА, но и еб*йшую мотивацию на наших онлайн эфирах, где я буду отвечать на вопросы и наставлять всех тех, кто сомневается в каких-то моментах вашего проявления себя в мире Instagram или YouTube.

Во время прохождения азбуки у вас просто не останется шансов не снимать контент или не знать, что с ним делать!

Ты еще ждешь? Чего не пойму только. Первая группа стартует 5 февраля, успей запрягнуть в этот мотивационный вагон 🚅
`
    let keyboard = Markup.inlineKeyboard(
        [
            [Markup.button.url('Забрать Азбуку Reels', 'https://azbukareels.ru/')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')],
        ]
    )
        if (tgBot === null) {
            return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
        } else {
           try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
           } catch (error) {
            console.log(error);
            
           }
        }
}

async function contentM (obj,tgBot = null,tgChatId = null){
let text = `<strong>Буква "Н" Наблюдение</strong>

Успешного креатора контента отделает одно очень важное умение - наблюдать и анализировать свой контент.

Для этого и существуют, на самом деле инструменты анализа ваших видео. В профессиональной панели вы можете отследить "среднее время просмотра" в инстаграм, а в YouTube и тик токе - вообще график удержания внимания ваших зрителей.

Умение собирать данные и в дальнейшем их анализировать приведёт вас к идеальной формуле создания ваших видео, которые будут досматривать до конца миллионы человек!

Своим опытом в анализе делятся ученики нашей "Азбуке Reels" в общем чате. Присоединяйся к курсу и ты!

p.s. чат доступен только для + и PRO версии курса
`
let keyboard = Markup.inlineKeyboard(
        [
            [Markup.button.url('Присоедениться к "Азбуке Reels"', 'https://azbukareels.ru/')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')],
        ]
    )
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
            
        }
        
    }
}

async function contentN (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "О" Охват аудитории</strong>

Если вы снимаете контент про себя - то это будет интересно десяткам, может сотне людей в вашем блоге.

Если вы снимаете контент, который закрывает о нише, то это будет интересно для тысячи людей

Если вы снимаете контент, который закрывает боли целевой аудитории - он набирает сотни тысяч.

Если вы снимаете видео, которое закрывает боли аудитории - это набирает миллионы просмотров.

Мыслите шире, думайте масштабнее и у вас появятся ролики на миллионы просмотров 👍
`
let keyboard = Markup.inlineKeyboard(
        [
            [Markup.button.url('Присоедениться к "Азбуке Reels"', 'https://azbukareels.ru/')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')],
        ]
    )
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
            
        }
    }
}

async function contentO (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "П" Подача</strong>
    
Давайте разберём на примере кино.

У каждого фильма есть свой темп повествования и подача истории. У Тарантино, например, всегда захватывающие и затянутые диалоги для того, чтобы прочувствовать внутренний мир героев, проникнуться ими и начать им сопереживать в разные необычных жизненных ситуациях.

В Джоне Уике, например, действия завязаны на экшене, быстром повествовании и динамике сюжета.

НО...

если Джона Уика погрузить в мир фильмов Тарантино, то он будет чувствовать себя некомфортно, ему не нужно будет разговаривать с другими, он просто вышебет кому-то мозга и побежит дальше расправляться с врагами.

Так же самая история и в съёмке видео. Если вам органична определенная динамика и подача - вы должны её довести до возможного идеала, чтобы по ощущениям казалось - вы точно в своей тарелке и тогда мне хочется вам верить и досмотреть ваше видео до конца.

Как усовершенствовать свой навык в подаче материала - мы разбираем на наших эфира "Азбука Reels"
`
    let keyboard = Markup.inlineKeyboard(
    [
        [Markup.button.url('"Забрать Азбуку Reels"', 'https://azbukareels.ru/')],
        [Markup.button.callback('Следующая буква', 'ShowLetter')],
    ]
)
let source = {source: './img/O.JPG'};
    if (tgBot === null) {
        return obj.replyWithPhoto(source, {caption: text, parse_mode: 'HTML', ...keyboard});
    } else {
        try {
            tgBot.sendPhoto(tgChatId,source,{caption: text, parse_mode: 'HTML', ...keyboard})
        } catch (error) {
            console.log(error);
            
        }
    }
}

async function contentP (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "Р" Рекомендации</strong>

Максимально простой совет для всех, кто начинает свой блог.

Я напоминаю, что мы здесь не из стеснительных и самым лучшим советом для всех, кто начинает активно развивать активно свой блог - <strong>попросить о первой рекомендации.</strong>

<strong>НО ПРИ УСЛОВИИ</strong>, что ваш контент действительно будет интересно смотреть даже людям, не знакомым с вами и тогда каждый твой друг или подруга не поленится закинуть твой рилс репостом к себе в сторис! Если 5-10 друзей закинет ваш ролик к себе в аккаунт - у вас в разы повысятся охваты и алгоритмы даже смогут посчитает ваш ролик уникальным и начнут показывать новой аудитории.

А как снимать такие Reels, чтобы их было не стремно закинуть к себе в сторис вашим друзьям - я рассказываю на курсе "Азбука Reels"
`
let keyboard = Markup.inlineKeyboard(
        [
            [Markup.button.url('Присоедениться к "Азбуке Reels"', 'https://azbukareels.ru/')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')],
        ]
    )
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
        }
    }
}

async function contentQ (obj,tgBot = null,tgChatId = null){
let text = `<strong>Буква "С" Сценарий для видео</strong>

Я разработал 10 универсальных сценариев ⚡

Одним из них я поделюсь прямо сейчас, если ты зайдешь в мой телеграм канал и не поленишься поставить огонёчек, на мой последний пост (там вообще любой пост заслуживает огонёчка от тебя, там я реально делюсь пользой каждый день)`
let keyboard = Markup.inlineKeyboard(
    [
        [Markup.button.url('Я прожал огонёчек на последний пост🔥🔥🔥', 'https://t.me/dnevnikreatora')],
        [Markup.button.callback('Получить бесплатный сценарий', 'additionalСontentQ')],
    ]
)
let source = {source: './img/Q.JPG'};
    if (tgBot === null) {
        return obj.replyWithPhoto(source, {caption: text, parse_mode: 'HTML', ...keyboard});
    } else {
        try {
            tgBot.sendPhoto(tgChatId,source,{caption: text, parse_mode: 'HTML', ...keyboard})
        } catch (error) {
            console.log(error);
        }
    }
}

async function additionalСontentQ (obj,tgBot = null,tgChatId = null){
let text = `<№4 Шаблон “Аренда внимания”

🤌Упаковка имеет значение и сейчас я вам это докажу.

Допустим, я даю вам несколько советов о том, как нужно работать с соц. сетями и какой контент делать. Это имеет смысл и звучало логично. А затем приходит Саша Митрошина и также дает вам совет по вашем маркетинговой стратегии в соц. сетях, только она дает советы полностью противоположные моим. 

Кого бы вы выбрали послушать? 

Скорее всего Сашу, так как она доказала своими результатами свою компетентность, что ставит её в более выгодное положение. Задействуйте это знание в своем контенте, берем в кредит славу и узнаваемость других, чтобы вызвать больше отклика у аудитории и привлечь больше внимания.

<i>Арендованное внимание → Информационный блок → Ваша ценность → Вовлечение / Призыв к действию</i>

📣 Аренда внимания

Мы не присваиваем чье-то имя или заслуги, мы просто заимствуем его для внимания зрителей! Скажем, для этого примера мы помогаем предпринимателям стать более продуктивными

Пример: Вместо “3 лайфхаков для продуктивности” попробуйте организовать свой день как Илон Маск

💬 Информационный блок
Они здесь только из-за имени, которое мы только что позаимствовали, удерживайте их внимание, давая им информацию, ради которой они здесь. Будьте краткими и простыми, мы не хотим, чтобы это видео превратилось в часовое интервью

<i>Пример: Илон планирует свой день на 5-минутные интервалы, при этом график он составляет заранее</i>

🔝 Ваша ценность

Теперь настало время вернуть себе авторитет и показать им, что вы не просто ведущий новостей. Добавьте этому видео какую-то ценность, кроме как сообщение о том, какой сумасшедший график работы у Илона.

<i>Пример: Этот метод называется Timeboxing. Timeboxing — это практика установки фиксированного количества времени для каждой задачи и включения этих блоков времени в ваше расписание. Я использую это ежедневно, и это помогло мне и моим клиентам достичь каждой цели, которую мы поставили в этом году.</i>

👉Вовлечение / Призыв к действию

Таким образом, теперь у вас есть выбор: вы можете либо добавить призыв к действию, чтобы попытаться повысить охваты этого поста, либо вы можете использовать этот пост, чтобы привлечь внимание к вашему продукту, особенно если вы добавили какое-то социальное доказательство

Пример с вовлечением: <i>подпишись, чтобы узнать больше лайфхаков и систем продуктивности</i>

Пример с предложением: <i>если ты хочешь узнать, как работать со временем, забирай мой бесплатный шаблон по тайм менеджменту по ссылке в шапке профиля</i>

🔥ФИНАЛЬНАЯ ВЕРСИЯ

<i>Вместо “3 лайфхаков для продуктивности” попробуйте организовать свой день как Илон Маск Илон планирует свой день на 5-минутные интервалы, при этом график он составляет заранее Этот метод называется Timeboxing. Timeboxing — это практика установки фиксированного количества времени для каждой задачи и включения этих блоков времени в ваше расписание. Я использую это ежедневно, и это помогло мне и моим клиентам достичь каждой цели, которую мы поставили в этом году. Если ты хочешь узнать, как работать со временем, забирай мой бесплатный шаблон по тайм менеджменту по ссылке в шапке профиля</i>
`
let keyboard = Markup.inlineKeyboard(
    [
        [Markup.button.url('Забрать ещё 9 сценариев', 'https://azbukareels.ru/')],
        [Markup.button.callback('Следующая буква', 'ShowLetter')],
    ]
)
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
        }
    }
}

async function contentR (obj,tgBot = null,tgChatId = null){
let text = `<strong>Буква "Т" Театральная подготовка</strong>

Большинство успешных медийных людей хотя бы раз в жизни заглядывали на "Урок актерского мастерства" от какого-то актера или режиссера театра.

Лично я так делал и меня это раскрыло совсем с другой стороны!

Для всех тех, кто:

· стесняется говориться на камеру
· боится что про тебя "как-то не так посмотрят"
· стесняется говорить тексты
Настоятельно рекомендую найти "Урок актерского мастерства" или "Урок по импровизации" у себя в городе и записаться на него.

Обещаю, что вы по другому взглянете на вещи, которые вам казались "стремными" раньше.

На курсе "Азбука Reels" я так же даю упражнения в проявлении себя на камеру, присоединяйся
`
        let keyboard = Markup.inlineKeyboard(
        [
            [Markup.button.url('Забрать Азбуку Reels', 'https://azbukareels.ru/')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')],
        ]
    )
    let source = {source: './img/R.JPG'};
        if (tgBot === null) {
            return obj.replyWithPhoto(source, {caption: text, parse_mode: 'HTML', ...keyboard});
        } else {
            try {
                tgBot.sendPhoto(tgChatId,source,{caption: text, parse_mode: 'HTML', ...keyboard})
            } catch (error) {
                console.log(error);
            }
        }
}

async function contentS (obj,tgBot = null,tgChatId = null){
let text = `<strong>Буква "У" Упростить</strong>

Моя суперсила, которую я применяю со своими учениками в личной работе - простыми словами объяснять сложные вещи в создании контента.

Когда каждый из вас возмет за правило упрощять все то, что вы знаете, то вы с больше долей вероятности сможете достучаться до большего числа людей, а как следствие и будете в своих видео набирать бОльшее количество просмотров.

Мы же за этим здесь, верно?

Секрет прост, вопрос лишь: "Придерживаетесь ли вы его?"

Очень легко получить обратную связь в работе с нами на курсе Азбука Reels на тарифе PRO или в личной работе с <a href="https:/t/me/ostashow">Денисом Осташовым</a> 
`
    let keyboard = Markup.inlineKeyboard(
            [
                [Markup.button.url('Записаться на тариф PRO', 'https://azbukareels.ru/#tariffs')],
                [Markup.button.callback('Следующая буква', 'ShowLetter')],
            ]
        )
        if (tgBot === null) {
            return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
        } else {
            try {
                tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
            } catch (error) {
                console.log(error);
                
            }
        }
}

async function contentT (obj,tgBot = null,tgChatId = null){
let text = `<strong>Буква "Ф" Фоновая музыка</strong>

Для придачи атмосферности ваших видео я всегда использую саунддизайн своих роликов. Основа его состоит в правильно подобранной музыке под настроение вашего видео, которая будет не отвлекать словами, а наоборот, мелодично дополнять ваши слова.

В "Азбуке Reels +" и "Азбуке Reels PRO" у вас будет доступ к личной библиотеке треков, состоящий из 200+ песен на портале Яндекс.Музыка.

С этой подборкой ваши Reels будут более атмосферными и интересными к просмотру, пользуйтесь 😉
`
let keyboard = Markup.inlineKeyboard(
        [
            [Markup.button.url('Записаться на Азбуку Рилс +', 'https://azbukareels.ru/#tariffs')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')],
        ]
    )
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
            
        }
    }
}

async function contentU (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "Х" Харизма</strong>

Убежден, что у каждого человека есть харизма.

Вопрос в том: "Насколько каждый из вас раскрыл её потенциал"

Вообще, когда у вас мощно прокачана харизма, то вам даже достаточно в комнату зайти и на вас люди уже обратят внимание и "что-то почувствуют".

Когда вы появляетесь в кадре, зрители так же считывают каждый ваш жест, ваш тембр голоса, вашу подачу, вашу уверенность в голосе, ваш глубокий посыл, ваше уменее шутить и еще с десяток других параметров.

Наша же задача - научиться "выкрутить" тумблер харизмы на максимум на данном этапе времени. Учимся это делать, получая обратную связь и вы заметите, как к вам потянутся люди и просмотры
`
        let keyboard = Markup.inlineKeyboard(
        [
            [Markup.button.url('Забрать Азбуку Reels', 'https://azbukareels.ru/')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')],
        ]
    )
    let source = {source: './img/U.JPG'};
        if (tgBot === null) {
            return obj.replyWithPhoto(source, {caption: text, parse_mode: 'HTML', ...keyboard});
        } else {
            try {
                tgBot.sendPhoto(tgChatId,source,{caption: text, parse_mode: 'HTML', ...keyboard})
            } catch (error) {
                console.log(error);
            }
        }
}

async function contentV (obj,tgBot = null,tgChatId = null){
let text = `<strong>Буква "Ц" Цена и ценность</strong>

Вопрос цены - важный вопрос.

Могу сказать лично, пройдя обучение продажам на высокий чек, что они явно отличаются от продаж на низкий не только "качеством клиентов", но и "качеством запроса".

Если у вас есть продукт и вы его хотите продвигать через Reels, то значит мы сможем помочь сформировать вашу ценность на рынке и упаковать её в ваш контент, чтобы вы начали зарабатывать благодаря этому инструменту привлечения клиентов.

Если же у вас нет продукта, то будем формировать ценность вашего аккаунта, чтобы всем, кто посмотрит ваш Reels было чётко понятно, зачем им подписываться на вас
`
let keyboard = Markup.inlineKeyboard(
        [
            [Markup.button.url('Записаться на Азбуку Рилс +', 'https://azbukareels.ru/#tariffs')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')],
        ]
    )
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
        }
    }
}

async function contentW (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "Ч" Частота кадров камеры</strong>

Вы вдумывались вообще, сколько настроек камеры в вашем телефоне и зачем они вообще нужны?

Это база, которую стоит освоить, прежде, чем начинать активно снимать видео, возможно даже, в специальных условиях.

Так же есть набор программ для монтажа, работы с текстом и с креативами, которыми вы можете пользоваться в Reels и в ваших сторис.

Всё это будет ждать вас в базовой версии "Азбуки Reels"
`
let keyboard = Markup.inlineKeyboard(
        [
            [Markup.button.url('Азбуку Reels PRO', 'https://azbukareels.ru/#tariffs')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')],
        ]
    )
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
        }
    }
}

async function contentX (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "Ш" Шрифты</strong>

Помимо стандартных шрифтов в инстаграме существует возможность добавать красивые и оригинальные шрифты в ваши видео и сторис.

Рассказываю про все эти инструменты в первом модуле "Азбуки Reels"
`
let keyboard = Markup.inlineKeyboard(
        [
            [Markup.button.url('Записаться на базовый тариф "Азбуки Reels"', 'https://azbukareels.ru/#tariffs')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')],
        ]
    )
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
        }
    }
}

async function contentY (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "Щ" Щедрость</strong>

Вы думаете, что конкуренты или ваши клиенты получат от вас "вашу базу знаний", то они никогда к вам не прийдут за услугой или продуктом?

Будьте щедрыми не не очкуйте выкладывать те инсайты, которыми пользуетесь сами и на базе которых вы обучаете своих учеников или применяете в работе с клиентами.

В этом и кроется успех в наборе подписчиков. Вам нужно просто записать свои знания и навыки и поделиться ими!

К вам придет клиент скорее всего не за этими инструментами, а за вашей харизмой, энергией и вашими навыками!

Делитесь и получайте в разы больше!
`
let keyboard = Markup.inlineKeyboard([
        [Markup.button.url('Записаться на "Азбуку Reels"', 'https://azbukareels.ru/')],
        [Markup.button.callback('Следующая буква', 'ShowLetter')],
    ])
let source = {source: './img/Y.JPG'};
    if (tgBot === null) {
        return obj.replyWithPhoto(source, {caption: text, parse_mode: 'HTML', ...keyboard});
    } else {
        try {
            tgBot.sendPhoto(tgChatId,source,{caption: text, parse_mode: 'HTML', ...keyboard})
        } catch (error) {
            console.log(error);
        }
    }
}

async function contentZ (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "Э" Энтузиазм</strong>

· Ты давно потерял интерес к тому, чтобы снимать видео?
· Ты не видишь больших результатов и тебе остачертело ждать свои миллионные просмотры?
· Хочешь создавать видео с кайфом?

Добавим энтузиазма и накинем идей в нашем брейншторме идей в нужном окружении. Согласитесь, что запал можно получить, находясь в правильном месте.

Для участников "Азбуки Reels PRO" мы будем устраивать брейншторм для генерации мощных идей для их дальнейшей реализации!
`
let keyboard = Markup.inlineKeyboard(
        [
            [Markup.button.url('Записаться в Azbyka Reels PRO', 'https://azbukareels.ru/#tariffs')],
            [Markup.button.callback('Следующая буква', 'ShowLetter')],
        ]
    )
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
        }
    }

}

async function contentZ2 (obj,tgBot = null,tgChatId = null){
    let text = `<strong>Буква "Ю" Юмор</strong>
    
Самый мощный инструмент для запуска такого триггера, как "репост видео" - это записать ролик с юморов. Куда больший эффект охватов имеют видео с юмором для людей не свойственным этого в их нише или в их "атмосфере блога"

Переодически это важно делать, так как такие видео смогут привлечь к вам новую аудиторию и дать возможность алгоритмам инстаграм "прогреть" ваш аккаунт для большого числа людей.

Но будьте аккуратны. Все блоги, которые основываются на юморе с трудом продают свои продукты или услуги, если у вас не уникальные сценарии с интеграцией ваших продаж.
`
let keyboard = Markup.inlineKeyboard([
        [Markup.button.url('Записаться на "Азбуку Reels"', 'https://azbukareels.ru/')],
        [Markup.button.callback('Следующая буква', 'ShowLetter')],
    ])
let source = {source: './img/Z2.JPG'};
    if (tgBot === null) {
        return obj.replyWithPhoto(source, {caption: text, parse_mode: 'HTML', ...keyboard});
    } else {
        try {
            tgBot.sendPhoto(tgChatId,source,{caption: text, parse_mode: 'HTML', ...keyboard})
        } catch (error) {
            console.log(error);
        }
    }
}

async function contentZ3 (obj,tgBot = null,tgChatId = null){
let text = `<strong>Буква "Я" Я даже не знаю...</strong>

... почему ты ещё не с нами в нашем мощнейшнем сообществе, которые прокачивается в создании вирусных, креативных и продающих видео "короткого" формата!

Поток курса запускается 5 февраля, поторопись приобрести "Азбуку Reels +" или "Азбуку Reels PRO".

Базовая версия доступна всегда на сайте, её вы можете приобрести не зависимо от времени.

Я - Денис Осташов, благодарю каждого, кто подписан со мной на моих ресурсах:

<a href="https://www.instagram.com/ostashow/">Instagram</a>

<a href="https://t.me/ostashow/">Telegram</a>

<a href="https://www.youtube.com/@ostashot">YouTube</a>
`
    let keyboard = Markup.inlineKeyboard([
            [Markup.button.url('Подключиться к Азбуке Reels', 'https://azbukareels.ru/')],
        ])
    if (tgBot === null) {
        return obj.replyWithHTML(text, {parse_mode: 'HTML',...keyboard});   
    } else {
        try {
            tgBot.sendMessage(tgChatId, text,{parse_mode: 'HTML',...keyboard})
        } catch (error) {
            console.log(error);
        }
    }

}

bot.start(async (ctx) => {
    await ctx.reply('Поехали', Markup.inlineKeyboard(
        [
            Markup.button.callback('⬇️', 'ShowLetter'),
        ]
    ));;
})

bot.action ('ShowLetter', async (ctx) => {
    const user = ctx.chat.id
    
    getAllUsers((err, users) => {

        if (err) {
            console.log(err,'Ошибка в ShowLetter');
        } else {
            users.forEach(async(userbd) => {
                
                if (userbd.telegram_id == user)
                    try {
                        console.log(userbd.current_count);
                        
                        let letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','Z2','Z3'];
                        let currentCount = userbd.current_count;
                        let currentLetter = userbd.letter;
                        let actualState = letters.findIndex((e) => {
                            return e === currentLetter
                        }) + 1;
                            if (currentCount <= 5){
                                switch (letters[actualState]) {
                                    case 'A':
                                        try {
                                            contentA(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'B':
                                        try {
                                            contentB(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'C':
                                        try {
                                            contentC(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'D':
                                        try {
                                            contentD(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'E':
                                        try {
                                            contentE(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'F':
                                        try {
                                            contentF(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'G':
                                        try {
                                            contentG(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'H':
                                        try {
                                            contentH(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'I':
                                        try {
                                            contentI(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'J':
                                        try {
                                            contentJ(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'K':
                                        try {
                                            contentK(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'L':
                                        try {
                                            contentL(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'M':
                                        try {
                                            contentM(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'N':
                                        try {
                                            contentN(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'O':
                                        try {
                                            contentO(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'P':
                                        try {
                                            contentP(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'Q':
                                        try {
                                            contentQ(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'R':
                                        try {
                                            contentR(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'S':
                                        try {
                                            contentS(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'L':
                                        try {
                                            contentL(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'T':
                                        try {
                                            contentT(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'U':
                                        try {
                                            contentU(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'V':
                                        try {
                                            contentV(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'W':
                                        try {
                                            contentW(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'X':
                                        try {
                                            contentX(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'Y':
                                        try {
                                            contentY(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'Z':
                                        try {
                                            contentZ(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'Z2':
                                        try {
                                            contentZ2(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                        break
                                    case 'Z3':
                                        try {
                                            contentZ3(null,bot.telegram, userbd.telegram_id);
                                        } catch (error) {
                                            console.log(error);
                                        }
                                    break        
                                }
                                updateLetterPlusCount(userbd.telegram_id,letters[actualState], ++userbd.current_count)
                            } else {
                                ctx.replyWithHTML(`Упппс!

Если ты хочешь получить все знания сразу, то можешь зайти к нам на сайт и приобрести один из пакетов «Азбуки Reels».

А следующую букву пришлём чуть позже, боту тоже нужен отдых 💆
`, Markup.inlineKeyboard(
               [
                   [Markup.button.url('Попасть в "Azbyka Reels"', 'https://azbukareels.ru/#tariffs')],
               ]
           ));
                            }
                        
                    } catch (error) {
                        console.log(error);
                    }

        })}
    }
)})

bot.action ('additionalСontentB', async(ctx) => {
    await ctx.replyWithDocument({source: './content/С.pdf', filename: 'Модуль 3.Монтаж.pdf'})
    await ctx.replyWithHTML(`Хочешь разобраться с тем, как создавать и монтировать видео?
        `,Markup.inlineKeyboard(
            [   
                [Markup.button.url('Заходи к нам в "Азбуку Reels"', 'https://azbukareels.ru/')],
                [Markup.button.callback('Следующая буква', 'ShowLetter')],
            ]
        ));
    }
)

bot.action ('additionalСontentC', (ctx) => {
    videoContentC(ctx)
})

bot.action ('additionalСontentQ', (ctx) => {
    additionalСontentQ(ctx)
})
bot.launch()

cron.schedule ( '1,5,10,15,20,25,30,35,40,45,50,55 * * * * *', async()=> {
    getAllUsers((err, users) => {

        if (err) {
            console.log(err,'Ошибка cron');
        } else {
            users.forEach(async(user) => {
                try {
                    const currentDate = new Date();
                    let currentCount = user.current_count;
                    let lastLetterSend = new Date(user.last_letter_send);
                    let isYesToday = (lastLetterSend.getFullYear() === currentDate.getFullYear() && lastLetterSend.getMonth() === currentDate.getMonth() && lastLetterSend.getDate() === (currentDate.getDate() - 1))
                    let letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','Z2','Z3'];
                    let currentLetter = user.letter;
                    let actualState = letters.findIndex((e) => {
                        return e === currentLetter
                    }) + 1;
                    console.log(actualState);
                    console.log(currentLetter);
                        switch (letters[actualState]) {
                            case 'A':
                                try {
                                    contentA(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'B':
                                try {
                                    contentB(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'C':
                                try {
                                    contentC(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'D':
                                try {
                                    contentD(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'E':
                                try {
                                    contentE(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'F':
                                try {
                                    contentF(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'G':
                                try {
                                    contentG(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'H':
                                try {
                                    contentH(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'I':
                                try {
                                    contentI(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'J':
                                try {
                                    contentJ(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'K':
                                try {
                                    contentK(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'L':
                                try {
                                    contentL(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'M':
                                try {
                                    contentM(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'N':
                                try {
                                    contentN(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'O':
                                try {
                                    contentO(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'P':
                                try {
                                    contentP(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'Q':
                                try {
                                    contentQ(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'R':
                                try {
                                    contentR(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'S':
                                try {
                                    contentS(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'L':
                                try {
                                    contentL(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'T':
                                try {
                                    contentT(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'U':
                                try {
                                    contentU(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'V':
                                try {
                                    contentV(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'W':
                                try {
                                    contentW(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'X':
                                try {
                                    contentX(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'Y':
                                try {
                                    contentY(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'Z':
                                try {
                                    contentZ(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'Z2':
                                try {
                                    contentZ2(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                                break
                            case 'Z3':
                                try {
                                    contentZ3(null,bot.telegram, user.telegram_id);
                                } catch (error) {
                                    console.log(error);
                                }
                            break        
                        }
                        
                    updateLetter(user.telegram_id,letters[actualState], actualState)
                } catch (error) {
                    console.log(error);
                }
        })}
    }
)})
