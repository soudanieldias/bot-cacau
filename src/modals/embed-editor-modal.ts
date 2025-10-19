import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';

export const createEmbedEditorModal = (
  field: string,
  currentValue?: string,
) => {
  console.log(
    `Criando modal para campo: ${field}, valor atual: "${currentValue}"`,
  );

  const modal = new ModalBuilder()
    .setCustomId(`embed-editor-${field}`)
    .setTitle(`Editar ${field}`);

  let placeholder = '';
  let maxLength = 1000;
  let style = TextInputStyle.Paragraph;

  switch (field) {
    case 'title':
      placeholder = 'Digite o título do embed...';
      maxLength = 256;
      style = TextInputStyle.Short;
      break;
    case 'description':
      placeholder = 'Digite a descrição do embed...';
      maxLength = 2000;
      style = TextInputStyle.Paragraph;
      break;
    case 'color':
      placeholder = 'Digite a cor em hexadecimal (ex: #FF0000) ou número...';
      maxLength = 20;
      style = TextInputStyle.Short;
      break;
    case 'thumbnail':
      placeholder = 'Digite a URL da thumbnail...';
      maxLength = 2048;
      style = TextInputStyle.Short;
      break;
    case 'image':
      placeholder = 'Digite a URL da imagem...';
      maxLength = 2048;
      style = TextInputStyle.Short;
      break;
    case 'footer':
      placeholder = 'Digite o texto do rodapé...';
      maxLength = 2048;
      style = TextInputStyle.Short;
      break;
    case 'author':
      placeholder = 'Digite o nome do autor...';
      maxLength = 256;
      style = TextInputStyle.Short;
      break;
    case 'authorIcon':
      placeholder = 'Digite a URL do ícone do autor...';
      maxLength = 2048;
      style = TextInputStyle.Short;
      break;
    case 'field':
      placeholder = 'Digite o nome do campo...';
      maxLength = 256;
      style = TextInputStyle.Short;
      break;
    case 'fieldValue':
      placeholder = 'Digite o valor do campo...';
      maxLength = 1024;
      style = TextInputStyle.Paragraph;
      break;
  }

  const input = new TextInputBuilder()
    .setCustomId(`embed-${field}-input`)
    .setLabel(field.charAt(0).toUpperCase() + field.slice(1))
    .setStyle(style)
    .setPlaceholder(placeholder)
    .setMaxLength(maxLength)
    .setRequired(false);

  console.log(
    `Configurando input para ${field}: style=${style}, maxLength=${maxLength}, currentValue="${currentValue}"`,
  );

  if (field === 'description') {
    console.log(
      `DEBUG DESCRIPTION: field=${field}, style=${style}, maxLength=${maxLength}, currentValue="${currentValue}", type=${typeof currentValue}`,
    );
  }

  if (field === 'description') {
    console.log(`TRATAMENTO ESPECIAL PARA DESCRIPTION`);

    if (currentValue !== undefined && currentValue !== null) {
      console.log(`Definindo valor para description: "${currentValue}"`);
      try {
        input.setValue(currentValue || '');
      } catch (error) {
        console.error(`Erro ao definir valor para description: ${error}`);
      }
    }
  } else {
    if (
      currentValue &&
      typeof currentValue === 'string' &&
      currentValue.trim() !== ''
    ) {
      console.log(`Definindo valor: "${currentValue}"`);
      try {
        input.setValue(currentValue);
      } catch (error) {
        console.error(`Erro ao definir valor: ${error}`);
      }
    } else {
      console.log(
        `Pulando definição de valor - valor vazio ou inválido: "${currentValue}"`,
      );
    }
  }

  const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
  modal.addComponents(row);

  return modal;
};

export const createFieldModal = () => {
  const modal = new ModalBuilder()
    .setCustomId('embed-editor-field')
    .setTitle('Adicionar Campo ao Embed');

  const nameInput = new TextInputBuilder()
    .setCustomId('embed-field-name-input')
    .setLabel('Nome do Campo')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Digite o nome do campo...')
    .setMaxLength(256)
    .setRequired(true);

  const valueInput = new TextInputBuilder()
    .setCustomId('embed-field-value-input')
    .setLabel('Valor do Campo')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Digite o valor do campo...')
    .setMaxLength(1024)
    .setRequired(true);

  const inlineInput = new TextInputBuilder()
    .setCustomId('embed-field-inline-input')
    .setLabel('Inline (true/false)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('true ou false')
    .setMaxLength(5)
    .setRequired(false);

  const nameRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    nameInput,
  );
  const valueRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    valueInput,
  );
  const inlineRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    inlineInput,
  );

  modal.addComponents(nameRow, valueRow, inlineRow);

  return modal;
};
