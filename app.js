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
let needSpell = true;
const logo =
    `   ______ ____   ______ _____ ____   ____   ____ 
  / ____// __ \\ / ____/|__ / / __ \\ / __ \\ / __ \\
 / / __ / /_/ // __/   /_ < / / / // / / // / / /
/ /_/ // _, _// /___ ___/ // /_/ // /_/ // /_/ / 
\\____//_/ |_|/_____//____/ \\____/ \\____/ \\____/  
                                                `
const helpInfo = `
${chalk.bold('Usage:')} gre [options]

${chalk.bold('Options:')}
${'-'.padEnd(15)}run in default mode(spell word)
${'-s'.padEnd(15)}run in silence mode(no word spell)
${'-h'.padEnd(15)}print node command line options (currently set) 

${chalk.bold('Runtime:')}
${'a-zA-Z'.padEnd(15)}First letter search
${'.'.padEnd(15)}Full dictionary search
${'/'.padEnd(15)}Replay the sound
${'enter'.padEnd(15)}Switch to next word

${chalk.cyan.bold('Find more at:'.padEnd(15)) + chalk.magenta.underline('https://github.com/Dramalf/GRE3000-cli')}
`
if (args[0] === '-h') {
    log(helpInfo)
    process.exit();
}
if (args[0] === '-s') needSpell = false;

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

function isFirstLetterEnglish(str) {
    const pattern = /^[a-zA-Z]/;
    return pattern.test(str);
};
function speak(word) {
    hasAudio = false;
    needSpell && googleTTS
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
        }).catch()


}
function show(text) {
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
            log(`${chalk.yellowBright('* ')}${chalk.white.bold(lm.padEnd(30))}${chalk.magenta(`/${lp.slice(1, lp.length - 1)}/`)}\n`)
        }
        const random = Math.floor(Math.random() * book.length);
        lastWord = book[random]
        const [word] = lastWord;
        show(word);
        speak(word);

    })
}
log(chalk.red(logo));
show('Press any key to start!')
