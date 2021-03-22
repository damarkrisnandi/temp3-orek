module.exports = {
    name: 'help',
    description: 'Help Center',
    type: 'textEmbed',
    content: () => {
        const message = 
        'Halo sobatku semua, demi kelancaran pekerjaan saya sebagai bot, saya akan membantu mas mbak yang ada disini untuk menyampaikan bahwa: \n' +
        'play <<lagu>> untuk  memainkan music \n' +
        'queue untuk melihat playlist\n' +
        'skip untuk skip\n' +
        'stop untuk berentiin lagu\n' +
        '\n' +
        'Suwun Slur \n'
        return message;
    }
}