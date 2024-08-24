const { Events, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const transcriptDir = './transcripts';
if (!fs.existsSync(transcriptDir)) {
    fs.mkdirSync(transcriptDir, { recursive: true });
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const logChannelId = '1276914278955225170'; // Log channel ID
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        try {
            // Handle String Select Menus
            if (interaction.isStringSelectMenu()) {
                if (interaction.customId === 'ticket_select') {
                    await interaction.deferReply({ ephemeral: true });
                    const selectedOption = interaction.values[0];
                    let ticketChannel;
                    let ticketDescription = '';

                    const generalStaffRoleId = '1276056087719575593'; 
                    const staffReportRoleId = '1276056087765975077'; 

                    const generalStaffRole = interaction.guild.roles.cache.get(generalStaffRoleId);
                    const staffReportRole = interaction.guild.roles.cache.get(staffReportRoleId);

                    if (!generalStaffRole || !staffReportRole) {
                        throw new Error(`One of the roles with IDs ${generalStaffRoleId} or ${staffReportRoleId} not found`);
                    }

                    const categoryID = '1276056088885854262'; 
                    const openTime = Math.floor(Date.now() / 1000);

                    ticketChannel = await interaction.guild.channels.create({
                        name: `${selectedOption}-${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        parent: categoryID,
                        topic: `Created by: ${interaction.user.id} | Opened at: ${openTime}`,
                        permissionOverwrites: [
                            {
                                id: interaction.guild.id,
                                deny: [PermissionsBitField.Flags.ViewChannel],
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                            },
                            {
                                id: selectedOption === 'staff_report' ? staffReportRole.id : generalStaffRole.id,
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                            },
                        ],
                    });

                    ticketDescription = `Thank you for submitting a ${selectedOption.replace('_', ' ')} ticket. Our staff team will reach back to you shortly.`;

                    const ticketEmbed = new EmbedBuilder()
                        .setTitle('Nitro Nexus | Server Support')
                        .setDescription(ticketDescription)
                        .setColor(`#000000`);

                    const claimButton = new ButtonBuilder()
                        .setCustomId('claim_ticket')
                        .setLabel('🙋‍♂️ Claim Ticket')
                        .setStyle(ButtonStyle.Primary);

                    const closeButton = new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('🔒 Close Ticket')
                        .setStyle(ButtonStyle.Danger);

                    const buttonRow = new ActionRowBuilder()
                        .addComponents(claimButton, closeButton);

                    await ticketChannel.send({ 
                        content: `${interaction.user}, <@&${selectedOption === 'staff_report' ? staffReportRoleId : generalStaffRoleId}>`, 
                        embeds: [ticketEmbed], 
                        components: [buttonRow] 
                    });

                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Ticket Created')
                            .setDescription(`Ticket created by ${interaction.user} (${interaction.user.id})`)
                            .setThumbnail("https://cdn.discordapp.com/icons/1276056087682089061/7a627dd3c417082c2ab36900e0a7b473.png?size=4096")
                            .addFields(
                                { name: 'Ticket Type', value: selectedOption },
                                { name: 'Ticket Channel', value: ticketChannel ? ticketChannel.toString() : 'Unknown' },
                                { name: 'Open Time', value: `<t:${openTime}:f>` }
                            )
                            .setColor(`#000000`);
                        await logChannel.send({ embeds: [logEmbed] });
                    }

                    await interaction.editReply({ content: `Ticket created: ${ticketChannel}` });
                }
            }

            // Handle Buttons
            else if (interaction.isButton()) {
                const channelTopic = interaction.channel.topic || '';
                const openTimeStr = channelTopic.split(' | ')[1]?.split('Opened at: ')[1];
                const openTime = openTimeStr ? parseInt(openTimeStr) : Math.floor(Date.now() / 1000); 
                const closeTime = Math.floor(Date.now() / 1000);

                if (interaction.customId === 'claim_ticket') {
                    const staffRoleId = '1276056087719575593'; 
                    const staffReportRoleId = '1276056087765975077'; 

                    const roleToCheck = interaction.channel.name.startsWith('staff-report') ? staffReportRoleId : staffRoleId;

                    if (!interaction.member.roles.cache.has(roleToCheck)) {
                        if (!interaction.replied) {
                            await interaction.reply({ content: 'You do not have permission to claim this ticket.', ephemeral: true });
                        }
                        return;
                    }

                    const existingClaim = interaction.channel.permissionOverwrites.cache.find(perm => perm.id === interaction.user.id);
                    if (existingClaim) {
                        if (!interaction.replied) {
                            await interaction.reply({ content: 'This ticket has already been claimed.', ephemeral: true });
                        }
                        return;
                    }

                    await interaction.channel.permissionOverwrites.edit(interaction.user.id, { 
                        ViewChannel: true, 
                        SendMessages: true 
                    });

                    await interaction.channel.permissionOverwrites.edit(roleToCheck, { 
                        ViewChannel: false, 
                        SendMessages: false 
                    });

                    const claimButton = new ButtonBuilder()
                        .setCustomId('claim_ticket')
                        .setLabel('🙋‍♂️ Claim Ticket')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true);

                    const buttonRow = new ActionRowBuilder()
                        .addComponents(claimButton, interaction.message.components[0].components.find(button => button.customId === 'close_ticket'));
                    
                    await interaction.update({ components: [buttonRow] });

                    if (!interaction.replied) {
                        await interaction.reply({ content: `Ticket claimed by ${interaction.user}.`, ephemeral: false });
                    }

                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Ticket Claimed')
                            .setDescription(`Ticket claimed by ${interaction.user} (${interaction.user.id})`)
                            .addFields(
                                { name: 'Ticket Channel', value: interaction.channel ? interaction.channel.toString() : 'Unknown' },
                                { name: 'Claim Time', value: `<t:${Math.floor(Date.now() / 1000)}:f>` }
                            )
                            .setColor(`#000000`);
                        await logChannel.send({ embeds: [logEmbed] });
                    }
                }

                if (interaction.customId === 'close_ticket') {
                    const ticketCloseEmbed = new EmbedBuilder()
                        .setTitle('Nitro Nexus | Ticket Closed')
                        .setDescription(`This ticket is now closed. The ticket creator will be notified once the ticket is permanently closed.`)
                        .setThumbnail("https://cdn.discordapp.com/icons/1276056087682089061/7a627dd3c417082c2ab36900e0a7b473.png?size=4096")
                        .addFields(
                            { name: 'Ticket Open time', value: `<t:${openTime}:f>` }, 
                            { name: 'Ticket Close time', value: `<t:${closeTime}:f>` }
                        )
                        .setColor(`#000000`);

                    const closeButton = new ButtonBuilder()
                        .setCustomId('close_ticket_final')
                        .setLabel('🔒 Final Close')
                        .setStyle(ButtonStyle.Danger);

                    const reopenButton = new ButtonBuilder()
                        .setCustomId('reopen_ticket')
                        .setLabel('🔄 Reopen')
                        .setStyle(ButtonStyle.Primary);

                    const transcriptButton = new ButtonBuilder()
                        .setCustomId('transcript_ticket')
                        .setLabel('📝 Transcript')
                        .setStyle(ButtonStyle.Primary);

                    const buttonRow = new ActionRowBuilder()
                        .addComponents(closeButton, reopenButton, transcriptButton);

                    await interaction.channel.send({ 
                        embeds: [ticketCloseEmbed], 
                        components: [buttonRow] 
                    });

                    if (!interaction.replied) {
                        await interaction.reply({ content: 'The ticket has been closed. It will be permanently closed once you click "Final Close".', ephemeral: true });
                    }

                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Ticket Closed')
                            .setDescription(`Ticket closed by ${interaction.user} (${interaction.user.id})`)
                            .setThumbnail("https://cdn.discordapp.com/icons/1276056087682089061/7a627dd3c417082c2ab36900e0a7b473.png?size=4096")
                            .addFields(
                                { name: 'Ticket Channel', value: interaction.channel ? interaction.channel.toString() : 'Unknown' },
                                { name: 'Close Time', value: `<t:${Math.floor(Date.now() / 1000)}:f>` }
                            )
                            .setColor(`#000000`);
                        await logChannel.send({ embeds: [logEmbed] });
                    }
                }

                if (interaction.customId === 'close_ticket_final') {
                    const attachment = new AttachmentBuilder(path.join(transcriptDir, `${interaction.channel.name}.html`));

                    const transcriptEmbed = new EmbedBuilder()
                        .setTitle('Nitro Nexus | Ticket Transcript')
                        .setDescription(`A transcript has been generated and sent to the log channel.`)
                        .setThumbnail("https://cdn.discordapp.com/icons/1276056087682089061/7a627dd3c417082c2ab36900e0a7b473.png?size=4096")
                        .setColor(`#000000`);

                    if (logChannel) {
                        await logChannel.send({
                            content: `Ticket transcript for ${interaction.channel.name}`,
                            files: [attachment],
                            embeds: [transcriptEmbed],
                        });
                    }

                    const finalEmbed = new EmbedBuilder()
                        .setTitle('Nitro Nexus | Ticket Permanently Closed')
                        .setDescription('This ticket has been permanently closed.')
                        .setColor('#000000');

                    await interaction.channel.send({ embeds: [finalEmbed] });
                    await interaction.channel.delete();

                    if (!interaction.replied) {
                        await interaction.reply({ content: 'The ticket has been permanently closed.', ephemeral: true });
                    }
                }

                if (interaction.customId === 'reopen_ticket') {
                    await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
                        ViewChannel: true,
                        SendMessages: true,
                    });

                    const reopenEmbed = new EmbedBuilder()
                        .setTitle('Nitro Nexus | Ticket Reopened')
                        .setDescription('The ticket has been reopened.')
                        .setColor('#000000');

                    const closeButton = new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('🔒 Close Ticket')
                        .setStyle(ButtonStyle.Danger);

                    const buttonRow = new ActionRowBuilder()
                        .addComponents(closeButton);

                    await interaction.update({ embeds: [reopenEmbed], components: [buttonRow] });

                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Ticket Reopened')
                            .setDescription(`Ticket reopened by ${interaction.user} (${interaction.user.id})`)
                            .setColor('#000000');
                        await logChannel.send({ embeds: [logEmbed] });
                    }
                }

                if (interaction.customId === 'transcript_ticket') {
                    const transcriptFilePath = path.join(transcriptDir, `${interaction.channel.name}.html`);

                    const transcriptEmbed = new EmbedBuilder()
                        .setTitle('Nitro Nexus | Ticket Transcript')
                        .setDescription('A transcript is being generated...')
                        .setColor('#000000');

                    await interaction.reply({ embeds: [transcriptEmbed], ephemeral: true });

                    try {
                        const messages = await interaction.channel.messages.fetch({ limit: 100 });
                        const transcriptContent = messages.reverse().map(msg => {
                            const time = msg.createdAt.toISOString();
                            const author = msg.author.username;
                            const content = msg.content || 'No content';
                            return `<p><strong>[${time}] ${author}:</strong> ${content}</p>`;
                        }).join('');

                        const transcriptHTML = `
                            <html>
                            <head>
                                <title>Transcript - ${interaction.channel.name}</title>
                            </head>
                            <body>
                                <h1>Transcript of ${interaction.channel.name}</h1>
                                <div>${transcriptContent}</div>
                            </body>
                            </html>
                        `;

                        fs.writeFileSync(transcriptFilePath, transcriptHTML, 'utf-8');

                        if (logChannel) {
                            const attachment = new AttachmentBuilder(transcriptFilePath);
                            await logChannel.send({
                                content: `Ticket transcript for ${interaction.channel.name}`,
                                files: [attachment],
                                embeds: [transcriptEmbed],
                            });
                        }
                    } catch (err) {
                        console.error('Error generating transcript:', err);
                        await interaction.followUp({ content: 'There was an error generating the transcript.', ephemeral: true });
                    }
                }
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'There was an error processing your request.', ephemeral: true });
            }
        }
    }
};
