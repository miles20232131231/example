const { Permissions, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-ticket')
        .setDescription('Create a ticket')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(interaction) {

        await interaction.reply({ content: 'Setting up ticket system...', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('Nitro Nexus | Server Support')
            .setDescription(`Welcome to the server support channel. Please select an option to continue. Opening false tickets would result in a server mute. 
                
                Not answering your ticket in 24/7 would result in a ticket close.`)
            .setColor(0x5de0e6)
            .setFooter({
                text: 'Nitro Nexus',
                iconURL: 'https://cdn.discordapp.com/icons/1276056087682089061/7a627dd3c417082c2ab36900e0a7b473.png?size=4096'
            });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select')
            .setPlaceholder('Select an option')
            .addOptions([
                {
                    label: 'Staff Report',
                    description: 'Report a staff member.',
                    value: 'staff_report',
                },
                {
                    label: 'General Support',
                    description: 'Get general support.',
                    value: 'general_support',
                },
            ]);

        const row = new ActionRowBuilder()
            .addComponents(selectMenu);

        await interaction.channel.send({ embeds: [embed], components: [row] });

        await interaction.editReply({ content: 'Ticket system setup complete!', ephemeral: true });
    },
};
