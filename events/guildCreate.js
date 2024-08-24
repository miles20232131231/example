const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildCreate',
  once: false,
  async execute(guild, client) {
    // Channel ID where you want to send the announcement
    const channelId = '1276914278955225170';
    const channel = client.channels.cache.get(channelId);

    if (!channel) {
      console.error(`Channel with ID ${channelId} not found.`);
      return;
    }

    try {
      // Fetch the audit logs to get the user who added the bot
      const auditLogs = await guild.fetchAuditLogs({
        type: 1, // Type 1 for bot additions
        limit: 1
      });

      const entry = auditLogs.entries.first();
      const userTag = entry ? `<@${entry.executor.id}>` : 'Unknown User';

      // Create an invite link to the server
      let inviteLink = 'No invite link available';
      try {
        const invites = await guild.invites.fetch();
        inviteLink = invites.first() ? invites.first().url : 'No invite link available';
      } catch (error) {
        console.error('Error fetching invites:', error);
      }

      // Create the embed
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Bot Added to Server')
        .setDescription(`${userTag} has added me to **${guild.name}**.\nServer Link: [Join Here](${inviteLink})`)
        .setFooter({ text: 'Thank you for adding me!' })
        .setTimestamp();

      // Create the text message
      const textMessage = `<@&1276914794888429639>`;

      // Send both the text message and the embed
      await channel.send({ content: textMessage });
      await channel.send({ embeds: [embed] });
      
      console.log(`Text message and embed sent to channel ${channelId} announcing the addition of the bot.`);
    } catch (error) {
      console.error('Error sending message or embed:', error);
    }
  },
};
