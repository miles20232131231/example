const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stocks')
    .setDescription('Check if you have the required amount of stock.'),
  async execute(interaction) {
    // Define the path to the transcript file
    const transcriptDirPath = path.join(__dirname, '../../data/transcripts');
    const transcriptFilePath = path.join(transcriptDirPath, 'stock.js');

    // Check if the file exists
    if (!fs.existsSync(transcriptFilePath)) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Error')
        .setDescription('Stock file not found.');

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      // Load the stock amount from the JS file
      const stockData = require(transcriptFilePath);
      const requiredStock = stockData.stockAmount;

      // Check if the user has the required amount of stock (this example assumes a placeholder check)
      const userStock = 10; // Replace this with actual stock check logic

      const stockEmbed = new EmbedBuilder()
        .setColor(userStock >= requiredStock ? '#00ff00' : '#ff0000')
        .setTitle('Stock Check')
        .setDescription(userStock >= requiredStock
          ? `Stocks online: ${requiredStock}.`
          : `Stocks online: ${requiredStock}.`)
        .setTimestamp();

      await interaction.reply({ embeds: [stockEmbed] });
    } catch (error) {
      console.error('Error handling stocks check:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Error')
        .setDescription('There was an error checking your stock amount.');

      await interaction.reply({ embeds: [errorEmbed] });
    }
  },
};
