'use strict';

/**
 * Synthesia (noun): Synthesizer synesthesia. Turns MIDI notes into colors!
 *
 * Uses electron and node-midi to map MIDI keyboard notes to the color wheel.
 * With C as red, each of the 12 notes moves a set amount around the spectrum.
 *
 * May be unsettling for synesthites whose pairs don't match up with this.
 *
 * Usage:
 *
 *   > npm i
 *   > npm run start
 *
 */
const electron = require('electron');

const averageColor = require('./lib/average-color.js');
const onKeyDown = require('./lib/on-key-down.js');

// Color variables.
const SATURATION = 1;
const LIGHTNESS = 0.5;

// C, C#, D, D#, E, F, F#, G, G#, A, A#, B.
const NUM_NOTES = 12;

// Set up Electron.
const {BrowserWindow, app} = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		fullscreen: true,
	});
	mainWindow.loadURL(`file://${__dirname}/index.html`);

	// Dereference the window object when the window is closed.
	mainWindow.on('closed', function () {
		mainWindow = null;
	})
}
app.on('ready', createWindow);
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

// Change the screen color when a note or chord is played.
onKeyDown(function paintColor (chord) {
	const colors = chord.map(note => [
		note / NUM_NOTES,
		SATURATION,
		LIGHTNESS,
	]);
	mainWindow.webContents.send('beauty', averageColor(colors));
});
