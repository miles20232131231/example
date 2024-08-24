const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stock-set')
    .setDescription('Set the stock amount for Nitro.')
    .addIntegerOption(option => 
      option.setName('how-much')
        .setDescription('The amount of stock to set.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const allowedRoleId = '1276914794888429639'; // Role ID to restrict access
    const stockAmount = interaction.options.getInteger('how-much');
    const channelId = '1276914278955225170';
    const channel = interaction.client.channels.cache.get(channelId);

    if (!channel) {
      console.error(`Channel with ID ${channelId} not found.`);
      return;
    }

    // Check if the user has the allowed role
    if (!interaction.member.roles.cache.has(allowedRoleId)) {
      await interaction.reply({ content: 'You do not have the required role to use this command.', ephemeral: true });
      return;
    }

    try {
      // Create the embed
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Nitro Stock Updated')
        .setDescription(`${interaction.user.tag} has restocked the Nitro stocks.\nThe new stock amount is ${stockAmount}.`)
        .setTimestamp();

      // Send the embed to the specified channel
      await channel.send({ embeds: [embed] });
      
      // Define file paths
      const transcriptDirPath = path.join(__dirname, '../../data/transcripts');
      const transcriptFilePath = path.join(transcriptDirPath, 'stock.js');

      // Ensure the directory exists
      if (!fs.existsSync(transcriptDirPath)) {
        fs.mkdirSync(transcriptDirPath, { recursive: true });
      }

      // Write the stock amount to the JS file
      const jsContent = `const stockAmount = ${stockAmount};\nmodule.exports = { stockAmount };`;
      fs.writeFileSync(transcriptFilePath, jsContent);

      console.log(`Stock amount set to ${stockAmount} and saved to ${transcriptFilePath}.`);
      await interaction.reply({ content: `Stock amount set to ${stockAmount}.`, ephemeral: true });
    } catch (error) {
      console.error('Error handling stock set:', error);
      await interaction.reply({ content: 'There was an error setting the stock amount.', ephemeral: true });
    }
  },
};
