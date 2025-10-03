import { EmbedBuilder, User, Guild } from 'discord.js';

interface YouTuberFormData {
  id: string;
  nickname: string;
  youtubeUrl: string;
  videoUrl: string;
}

export const youTuberResponseEmbed = (
  user: User,
  guild: Guild,
  formData: YouTuberFormData,
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor('#2f3136')
    .setAuthor({
      name: guild.name,
      ...(guild.iconURL() ? { iconURL: guild.iconURL()! } : {}),
    })
    .setThumbnail(user.displayAvatarURL())
    .setDescription(
      `**Usuário:** ${user}\n**ID:** \`${user.id}\`\n**Formulário ID:** \`${formData.id}\``,
    )
    .addFields(
      {
        name: 'Nickname',
        value: `\`\`\`${formData.nickname}\`\`\``,
        inline: true,
      },
      {
        name: 'Link do Canal',
        value: `\`\`\`${formData.youtubeUrl}\`\`\``,
        inline: true,
      },
      {
        name: 'Link do Vídeo',
        value: `\`\`\`${formData.videoUrl}\`\`\``,
        inline: true,
      },
    )
    .setFooter({ text: 'Formulário de Influencer' })
    .setTimestamp();
};
