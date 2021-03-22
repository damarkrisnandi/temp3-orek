const yts = require( 'yt-search' );

module.exports = {
    search: async (message, serverQueue) => {
        const args = message.content;
        args.replace(args.split(' ')[0] + ' ', '');
        const r = await yts( args );
        const videos = r.videos.slice( 0, 5 )
        return videos;
    }
}