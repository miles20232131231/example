const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('boost')
    .setDescription('Provide instructions to invite the bot and boosting bots to your server.')
    .addStringOption(option => 
      option.setName('server-link')
        .setDescription('Provide your server invite link here (Note: The bot cannot join through this link).')
        .setRequired(true)
    ),
  async execute(interaction) {
    const serverLink = interaction.options.getString('server-link');
    const botInviteLink = 'https://discord.com/oauth2/authorize?client_id=1276904887527018589&permissions=8&scope=bot+applications.commands';
    const boostingBots = [
      'https://discord.com/oauth2/authorize?client_id=1276904887527018589&permissions=8&scope=bot+applications.commands'
    ];

    let reply = `
      **Invite Our Bot**: [Invite Link](${botInviteLink})
      **Invite Boosting Bots**:
      ${boostingBots.map(link => `[Invite Link](${link})`).join('\n')}
      **Note:** To boost the server, you will need to do it manually through the Discord client.

      If you want to provide a server link where our bot can be invited, please send the invite link here. 
      \`Note:\` The bot cannot automatically join servers through this link. This step is manual and for guidance only.
    `;

    if (serverLink) {
      reply += `\n\nYou provided a server link: [Server Link](${serverLink}). Please note that the bot cannot automatically join servers through this link.`;
    }

    // Create and send the embed
    const embed = new EmbedBuilder()
      .setTitle('Boost Instructions')
      .setDescription(reply)
      .setColor('#00FF00'); // Set the color as needed

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
