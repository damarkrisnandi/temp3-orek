const Discord = require('discord.js');
const {
	prefix,
	token,
} = require('./config.json');
const ytdl = require('ytdl-core');
const { search } = require('./search');
const help = require('./commands/help'); 

let searchList = [];
let queueContruct = null;

const client = new Discord.Client();

let queue = new Map();

status = '--help'
// ready
client.once('ready', () => {
    console.log('Ready!');
    client.user.setActivity(status);
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const serverQueue = queue.get(message.guild.id);

    // action
    if (message.content.startsWith(`${prefix}play`)) { execute(message, serverQueue);return; } 
    else if (message.content.startsWith(`${prefix}skip`)) { skip(message, serverQueue);return;} 
    else if (message.content.startsWith(`${prefix}stop`)) { stop(message, serverQueue);return;} 
    else if (message.content.startsWith(`${prefix}cancel`)) { searchList = [];return;} 
    else if (message.content.startsWith(`${prefix}queue`)) { playlist(message, serverQueue);return;} 
    else if (message.content.startsWith(`${prefix}help`)) { message.channel.send('```' + help.content() + '```') }
});

/**
 * 
 * MAIN METHOD
 * 
 */

async function execute(message, serverQueue) {
    const args = message.content.split(" ");
  
    console.log(message.member);
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "Join voice cenel dulu broh"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }

    let vid = null;
    // mulai pencarian videonya
    if (searchList.length == 0) {
        searchList = await search(message, serverQueue);
        const view = searchList.map(v => {
            return `[${searchList.indexOf(v) + 1}] ${ v.title } (${ v.timestamp }) | ${ v.author.name }`
        }).join('\n')
        const header = `Hasil Pencarian dari ${message.content.replace(args[0] + ' ', '')}:\n`;
        const guide = `\n\nbalas dengan ${prefix}play [angka] untuk mulai play\nbalas dengan ${prefix}cancel untuk membatalkan`
        message.channel.send('```' + header + view + guide + '```');
        return;

    } else {
        vid =   parseInt(args[1]) != NaN && searchList.length >= parseInt(args[1]) ? 
                searchList[parseInt(args[1]) - 1] : searchList[0];
        searchList = [];
    }
  
    // dapet url, masukin sini
    const songInfo = await ytdl.getInfo(vid.url);
    const song = {
        index: queueContruct ? queueContruct.songs.length + 1 : 1,
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          timestamp: vid.timestamp
     };
  
    if (!serverQueue) {
      queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
  
      queueContruct.songs.push(song);
      queue.set(message.guild.id, queueContruct);
  
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} ditambahin ke playlist`);
    }
  }
  
 function  skip(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "Masuk ke voice cenel dulu gan"
      );
    if (!serverQueue)
      return message.channel.send("Gaada yg bisa diskip");
    serverQueue.connection.dispatcher.end();
  }
  
  function stop(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "Masuk ke voice cenel dulu gan"
      );
      
    if (!serverQueue)
      return message.channel.send("Gaada yg bisa distop");
      
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }

  function playlist(message, serverQueue) {
    if (serverQueue) {
        const header = '>> Playlist Server ini << \n'
        message.channel.send('```' + header + '<np>' + serverQueue.songs.map(v => `${ v.title } (${ v.timestamp })` ).join('\n') + '```');
        // message.channel.send(generateTextEmbed('Platlist', queueContruct.songs.map(v => `**${ v.title }** (${ v.timestamp })`).join('\n')))
    } else {
        message.channel.send('Playlist Kosong, pilih lagu dulu gan');
    }
  }

  function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
  
    serverQueue.textChannel.send(`Ngeplay: **${song.title}**`);
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  }

client.login(token);