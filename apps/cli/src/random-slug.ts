const adjectives = [
	"bright", "calm", "dark", "eager", "fair", "gentle", "happy", "idle",
	"jolly", "keen", "lively", "merry", "noble", "odd", "proud", "quick",
	"rare", "sharp", "tall", "vivid", "warm", "young", "bold", "cool",
	"dizzy", "fancy", "grand", "hazy", "icy", "jazzy",
];

const nouns = [
	"apple", "brook", "cloud", "dawn", "eagle", "flame", "grove", "hill",
	"island", "jewel", "kite", "lake", "moon", "nest", "ocean", "pine",
	"quill", "river", "stone", "tree", "vine", "wave", "yarn", "breeze",
	"cliff", "delta", "frost", "gem", "heron", "iris",
];

const randomIndex = (length: number) => {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	return array[0] % length;
};

export const generateSlug = () =>
	`${adjectives[randomIndex(adjectives.length)]}-${nouns[randomIndex(nouns.length)]}`;
