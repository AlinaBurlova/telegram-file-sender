import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Ключи для SecretStorage
const TOKEN_KEY = 'telegramBotToken';
const CHAT_ID_KEY = 'telegramChatId';

export function activate(context: vscode.ExtensionContext) {
    console.log('Telegram File Sender activated');

    // Команда настройки
    const setupCmd = vscode.commands.registerCommand(
        'telegram-sender.setup',
        async () => {
            const token = await vscode.window.showInputBox({
                prompt: 'Введите токен бота (от @BotFather)',
                password: true,
                ignoreFocusOut: true
            });
            if (!token) {
				return;
			}

            const chatId = await vscode.window.showInputBox({
                prompt: 'Введите ваш chat_id (от @userinfobot)',
                ignoreFocusOut: true
            });
            if (!chatId) {
				return;
			}

            await context.secrets.store(TOKEN_KEY, token);
            await context.secrets.store(CHAT_ID_KEY, chatId);
            vscode.window.showInformationMessage('Настройки Telegram сохранены');
        }
    );

    // Команда отправки файла
    const sendCmd = vscode.commands.registerCommand(
        'telegram-sender.sendFile',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('Нет открытого файла');
                return;
            }

            const token = await context.secrets.get(TOKEN_KEY);
            const chatId = await context.secrets.get(CHAT_ID_KEY);

            if (!token || !chatId) {
                const action = await vscode.window.showErrorMessage(
                    'Сначала настройте токен и chat_id',
                    'Настроить сейчас'
                );
                if (action === 'Настроить сейчас') {
                    await vscode.commands.executeCommand('telegram-sender.setup');
                }
                return;
            }

            const filePath = editor.document.uri.fsPath;
            const fileName = path.basename(filePath);

            try {
                await vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: `Отправка "${fileName}" в Telegram...`,
                        cancellable: false
                    },
                    async () => {
                        await sendDocument(filePath, token, chatId);
                    }
                );
                vscode.window.showInformationMessage(
                    `Файл "${fileName}" отправлен в Telegram`
                );
            } catch (err: any) {
                vscode.window.showErrorMessage(
                    `Ошибка отправки: ${err.message}`
                );
            }
        }
    );

    context.subscriptions.push(setupCmd, sendCmd);
}

async function sendDocument(
    filePath: string,
    token: string,
    chatId: string
): Promise<void> {
    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', blob, fileName);
    formData.append('caption', `📁 ${fileName} — sent from VS Code`);

    const url = `https://api.telegram.org/bot${token}/sendDocument`;
    const response = await fetch(url, { method: 'POST', body: formData });
    const result: any = await response.json();

    if (!result.ok) {
        throw new Error(result.description || 'Telegram API error');
    }
}

export function deactivate() {
    console.log('Telegram File Sender deactivated');
}