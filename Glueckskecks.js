//Include needed jsons
var config = require('./config');
var changelog = require('./changelog');

//Include some Funktions
var f = require('./Funktions');
//getDateTime() Returns german date & time Format
//log() Logs with Time and Date
//getRandomInt(max)
//uptime(Time_started)

//Include simple modules
var fs = require("fs");
const util = require('util');
const hash = require('hash-int');
const newI18n = require('new-i18n');
const i18n = newI18n(__dirname + '/languages', ['en', 'de']);

//Include complex modules
const Telebot = require('telebot');
const bot = new Telebot({
	token: config.bottoken,
	limit: 1000,
        usePlugins: ['commandButton']
});

//Create and modify support variables
var Time_started = new Date().getTime();
var botname = config.botname;
var version = config.botversion;
let versionfix = version.replace(/[.]/g,'_',);

var changelog_latest = changelog[versionfix];
var LastConnectionLost = new Date();

bot.start(); //Telegram bot start


//Startup Message
setTimeout(function(){
console.log("Bot (" + botname + ") started at " + f.getDateTime(new Date()) + " with version " + version)
bot.sendMessage(config.isSuperAdmin, "Bot started on Version " + version)
f.log("Pushed bot start to the admin");
}, 2000);

//Telegram Errors
bot.on('reconnecting', (reconnecting) => {
	f.log(util.inspect(reconnecting, true, 99));
	f.log("Lost connection");
	var LastConnectionLost = new Date();
});
bot.on('reconnected', (reconnected) => {
	f.log(util.inspect(reconnected, true, 99));
	f.log("connection successfully");
	bot.sendMessage(config.isSuperAdmin, "Bot is back online. Lost connection at " + f.getDateTime(LastConnectionLost))
});

//Userimput
//Basics
bot.on(/^\/botinfo( .+)*$/i, (msg, props) => {
		bot.deleteMessage(msg.chat.id, msg.message_id);
        var Para = props.match[1]
		if (props.match[1] === undefined){
			var lang = "de";
		}else{
			Para = Para.replace(/\s/g, '');
			var lang = Para;
		}
		if(i18n.languages.includes(lang)){
			var zufallnumber = f.getRandomInt(config.fortuneCookies);
			var zufall = zufallnumber.toString();
			msg.reply.text(i18n(lang, 'botinfo', { botname: botname, version: version, changelog_latest: changelog_latest})).then(function(msg)
					{
                     setTimeout(function(){
                             bot.deleteMessage(msg.chat.id,msg.message_id);
                     }, config.WTdelmsglong);
             });
		}else{
			msg.reply.text("This language does not exist in my DB. I´m sorry.");
		}
});

bot.on(/^\/start$/i, (msg) => {
	bot.deleteMessage(msg.chat.id, msg.message_id);
	if(msg.chat.type != "private")
	{
		if(msg.text.split(' ')[0].endsWith(botname))
		{
		let startmsg = "This bot will post random fortune cookie lines. Just use /luck";
		msg.reply.text(startmsg).then(function(msg)
	                        {
	                                setTimeout(function(){
	                                        bot.deleteMessage(msg.chat.id,msg.message_id);
	                                }, config.WTdelmsglong);
	                        });
		bot.deleteMessage(msg.chat.id, msg.message_id);
		}
	}else{
		let startmsg = "This bot will post random fortune cookie lines. Just use /luck";
		msg.reply.text(startmsg);
		bot.deleteMessage(msg.chat.id, msg.message_id);
	}
});

bot.on(/^\/help$/i, (msg) => {
		bot.deleteMessage(msg.chat.id, msg.message_id);
		msg.reply.text("Use /luck <language>\nexample: \n/luck --> Will give german output\n /luck en --> Will give english output\n\nUse /lang to display supportat languages\nUse /botinfo to see version, last changes\n Use /uptime to see for how long the bot is running")
});

bot.on(/^\/lang$/i, (msg) => {
		bot.deleteMessage(msg.chat.id, msg.message_id);
		msg.reply.text("Supported languages are : \n" + i18n.languages)
});

bot.on(/^\/luck( .+)*$/i, (msg, props) => {
		bot.deleteMessage(msg.chat.id, msg.message_id);
        var Para = props.match[1]
		if (props.match[1] === undefined){
			var lang = "de";
		}else{
			Para = Para.replace(/\s/g, '');
			var lang = Para;
		}
		if(i18n.languages.includes(lang)){
			var zufallnumber = f.getRandomInt(config.fortuneCookies);
			var zufall = zufallnumber.toString();
			msg.reply.text(i18n(lang, zufall));
		}else{
			msg.reply.text("This language does not exist in my DB. I´m sorry.");
		}
});

bot.on(/^\/uptime$/i, (msg) => {
		bot.deleteMessage(msg.chat.id, msg.message_id);
		msg.reply.text("Uptime: " + f.uptime(Time_started))
});

//Inline Request Handler
bot.on('inlineQuery', msg => {

    let query = msg.query;
	var zufallnumber = f.getRandomInt(config.fortuneCookies);
	var zufall = zufallnumber.toString();

    // Create a new answer list object
    const answers = bot.answerList(msg.id, {cacheTime: 1});

    // Article
    answers.addArticle({
        id: 'luckde',
        title: 'Zufälliger Glückskeksspruch',
        description: `Language: German`,
        message_text: (i18n('de', zufall))
    });
	
	answers.addArticle({
        id: 'lucken',
        title: 'Random fortune cookie saying',
        description: `Language: English`,
        message_text: (i18n('en', zufall))
    });
    return bot.answerQuery(answers);

});




