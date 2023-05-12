#!/usr/bin/env node
import xlsx from 'node-xlsx';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs'
import path from 'path'
import sound from 'sound-play';
import readline from 'readline';
import * as googleTTS from 'google-tts-api';
import { input } from '@inquirer/prompts';
import { fileURLToPath } from 'url'





const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const args = process.argv.slice(2);
const log = console.log;

if (args[0] == '-h') {
    log(chalk.yellowBright(`\n\n- [a-zA-Z] First letter search\n- [.] Full dictionary search\n- Press enter key to switch word\n- Press / to replay the sound`));
    process.exit();
}

// read dictionary
const spinner = ora(`Loading ${chalk.red('dictionary')}`).start();
const workSheetsFromFile = xlsx.parse(path.join(__dirname, `gre3000.xlsx`));
const dic = workSheetsFromFile[0].data.map(i => i.slice(-6))

const wordsMap = {};
dic.forEach(item => {
    const [word, ukp, usp, mean] = item;
    if (!wordsMap[word[0]]) {
        wordsMap[word[0]] = []
    }
    wordsMap[word[0]].push(item)
});
spinner.succeed(chalk.gray('Dictionary loaded!'))

let lastWord = null
let book = dic
let initial = false
const audioPath = path.join(__dirname, 'temp.mp3')
let hasAudio = false
const rl = readline.createInterface({
    input: process.stdin,
});
rl.input.on('keypress', (key) => {
    if (key === '/' && hasAudio) {
        sound.play(audioPath)
    }
    return null;
});
const isFirstLetterEnglish = (str) => {
    const pattern = /^[a-zA-Z]/;
    return pattern.test(str);
};
const show = (text) => {
    input({
        message: chalk.cyanBright.bold(text)
    }).then((res) => {
        const useAll = res[0] === '.';
        if (useAll) book = dic;
        else if (res[0] && isFirstLetterEnglish(res) && res[0] !== initial) {
            initial = res[0];
            book = wordsMap[initial];
        }
        if (lastWord) {
            const [, lp, , , lm,] = lastWord
            log(
                chalk.yellowBright('* ') +
                chalk.white.bold(lm) +
                new Array(20 < lm.length ? 3 : 20 - lm.length).fill(' ').join(' ') +
                chalk.magenta(`/${lp.slice(1, lp.length - 1)}/`) +
                '\r\n'
            )
        }
        const random = Math.floor(Math.random() * book.length);
        lastWord = book[random]
        const [word] = lastWord;
        show(word);
        hasAudio = false;
        googleTTS
            .getAudioBase64(word, {
                lang: 'en',
                slow: false,
                host: 'https://translate.google.com',
                timeout: 3000,
            })
            .then(base64Data => {
                const audioBuffer = Buffer.from(base64Data, 'base64');
                fs.writeFileSync(audioPath, audioBuffer);
                sound.play(audioPath)
                hasAudio = true;
            })

    })
}
show(chalk.gray(`Press any key to start 
- [a-zA-Z] First letter search 
- [.] Full dictionary search 
- Press enter key to switch word 
- Press / to replay the sound`))
