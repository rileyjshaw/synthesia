'use strict';

/**
 * Exports a function that accepts a callback which will be called whenever a
 * key or chord is played on the attached MIDI keyboard.
 */
const midi = require('node-midi');

// Max time delay between two keypresses to form a chord (in milliseconds).
const MAX_CHORD_DELAY = 50;

// MIDI status codes.
const STATUS_CODES = {
	0x90: 'DOWN',
};

// Set up a new input.
const input = new midi.input();

// Hack, but it works.
const state = {
	chord: [],
	triggerFn: null,
};

// Add a brief delay before triggering in case the user is actually trying to
// play a chord.
let triggerTimeout = null;
function trigger () {
	const {chord, triggerFn} = state;

	triggerFn && triggerFn(chord);

	// Reset the chord.
	state.chord = [];
}

input.on('message', function(_, message) {
	const [status, key] = message;
	const {keysDown} = state;

	// Early exit for everything but keydown signals.
	if (STATUS_CODES[status] !== 'DOWN') {
		return;
	}

	state.chord.push(key % 12);
	clearTimeout(triggerTimeout);
	triggerTimeout = setTimeout(trigger, MAX_CHORD_DELAY);
});

// Open the first available input port, YOLO.
input.openPort(0);

// lol sry everybody...
module.exports = function onKeyDown (fn) {
	state.triggerFn = fn;
}
