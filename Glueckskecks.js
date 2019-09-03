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

var langde = fs.readFileSync('./languages/de.json');
var langen = fs.readFileSync('./languages/en.json');
langde = langde.toString().split('\n');
langen = langen.toString().split('\n');
var deMAX = (langde.length - 2) - config.NotFortuneCookieLinesInJsonFile;
var enMAX = (langen.length - 2) - config.NotFortuneCookieLinesInJsonFile;
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
		msg.reply.text("Use /luck [language]\nexample: \n/luck --> Will give german output\n /luck en --> Will give english output\n\nUse /lang to display supportat languages\nUse /botinfo to see version, last changes\nUse /uptime to see for how long the bot is running\nUse /lang to see all available languages\nUse /add [language] [Your cookie saying in the given language]")
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
		if(lang == 'de'){ var zufallnumber = f.getRandomInt(deMAX);}
		if(lang == 'en'){ var zufallnumber = f.getRandomInt(enMAX);}
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

bot.on(/^\/add$/i, (msg) => {
	 msg.reply.text("You must add a fortune cookie saying. Like:\n'/add Stay clam. You are on top.'\n\nLike /add en You can rely on your Intuition.").then(function(msg)
             {
                     setTimeout(function(){
                             bot.deleteMessage(msg.chat.id,msg.message_id);
                     }, config.WTdelmsglong);
             });
             bot.deleteMessage(msg.chat.id, msg.message_id);

     bot.deleteMessage(msg.chat.id, msg.message_id);
});

bot.on(/^\/add(.+)$/i, (msg, props) => {
	const Para = props.match[1].split(' ');
		var lang = Para[1].toLowerCase();
		var MSG = Para[2];
		const replyMarkup = bot.inlineKeyboard([
        [
            bot.inlineButton('Yes', {callback: 'AddYes'}),
			bot.inlineButton('No', {callback: 'AddNo'})
        ]
		]);
	bot.deleteMessage(msg.chat.id, msg.message_id);
	if(i18n.languages.includes(lang)){
		for(var i = 3; i < Para.length;i++){
			MSG = MSG + " " + Para[i];
		}
			msg.reply.text("Your suggestion was send:\n" + MSG + "\n\nLanguage: " + lang)
			bot.sendMessage(config.suggestionGroup, " New suggestion: \n" + MSG + "\n\nLanguage: " + lang, {replyMarkup});
	}else{
		msg.reply.text("Coudn´t send your suggestion:\n" + MSG + "\n\nThe language you provided isn´t in my DB, i´m sorry.\nIf you want to add a new language you can do so [HERE](https://github.com/BolverBlitz/Glueckskecks-Bot)", { parseMode: 'markdown' });
	}
});

//Inline Request Handler
bot.on('inlineQuery', msg => {

    let query = msg.query;
	//var zufall = zufallnumber.toString();
	var zufallDE = f.getRandomInt(deMAX).toString();
	var zufallEN = f.getRandomInt(enMAX).toString();
    // Create a new answer list object
    const answers = bot.answerList(msg.id, {cacheTime: 1});

    // Article
    answers.addArticle({
        id: 'luckde',
        title: 'Zufälliger Glückskeksspruch',
        description: `Language: German`,
        message_text: (i18n('de', zufallDE))
    });
	
	answers.addArticle({
        id: 'lucken',
        title: 'Random fortune cookie saying',
        description: `Language: English`,
        message_text: (i18n('en', zufallEN))
    });
    return bot.answerQuery(answers);

});

//Callback Handler
bot.on('callbackQuery', (msg) => {
    //console.log('callbackQuery data:', msg.data);
    bot.answerCallbackQuery(msg.id);
	var chatId = msg.message.chat.id;
	var messageId = msg.message.message_id;
	var editText = msg.message.text.split(' ');
	var editText2 = msg.message.text.split('\n');
	var lang = editText[editText.length-1];
	//console.log(lang);
	
	var editTextOutput = "";
	for(var i = 2; i < editText.length;i++){
		editTextOutput = editTextOutput + " " + editText[i];
	}
	
    if(msg.data=="AddYes")
    {
		//bot.deleteMessage(ChatId, MessageId)
		bot.editMessageText(
            {chatId: chatId, messageId: messageId}, `<b>I have added:</b> ${ editTextOutput }`,
            {parseMode: 'html'}
        ).catch(error => console.log('Error:', error));
		newline(editText2[1], lang);
    }
	if(msg.data=="AddNo")
    {
		//bot.deleteMessage(ChatId, MessageId)
		bot.editMessageText(
            {chatId: chatId, messageId: messageId}, `<b>I refused:</b> ${ editTextOutput }`,
            {parseMode: 'html'}
        ).catch(error => console.log('Error:', error));
		console.log("I refused:  " + editText2[1]);
    }
});

function newline(editText, lang) {
	var file = fs.readFileSync('./languages/' + lang + '.json'); //Read lang.json
	filearray = file.toString().split('\n');
	var NextNumberSplitter = filearray[filearray.length-2];
	NextNumberSplitter = NextNumberSplitter.split('"');
	var NextNumber = Number(NextNumberSplitter[1]) + 1;
	//console.log(NextNumber);
	
	var addhelper = fs.readFileSync('./addHelper.file'); //Stupid fix for a problem that shouldn't exist in the first place
	addhelper = addhelper.toString();
	addhelper = addhelper.replace('NextNumber',NextNumber,);
	addhelper = addhelper.replace('editText',editText,);
	//console.log(addhelper);
	var newfile = [];
	newfile = newfile.toString();
	
	for(var i = 0; i < filearray.length-2;i++){
		newfile = newfile + filearray[i] + "\n";
	}
	newfile = newfile + filearray[filearray.length-2] + ",\n";
	newfile = newfile + "\t" + addhelper + "\n";
	newfile = newfile + "}";

	//console.log(newfile);
	obj = JSON.parse(newfile); //Check ob JSNON File ist richtig formatiert. Wenn hier Crash, dann ist das json beschädigt!
	//console.log(obj);
	fs.writeFile('./languages/' + lang + '.json', newfile, (err) => {if (err) console.log(err);
		console.log("Added " + editText + "to\n./languages/" + lang + ".json");
	});
}

	
	