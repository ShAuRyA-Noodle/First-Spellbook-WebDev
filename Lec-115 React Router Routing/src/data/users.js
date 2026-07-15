// Sample directory used by Home.jsx and User.jsx so the dynamic
// "/user/:username" route is reachable by clicking, not just by typing a URL.
const users = [
  {
    username: 'ada',
    name: 'Ada Lovelace',
    role: 'Analyst, Analytical Engine',
    bio: 'Wrote the first published algorithm intended for a machine to run.',
    color: '#f5a524',
  },
  {
    username: 'grace',
    name: 'Grace Hopper',
    role: 'Compiler Pioneer, US Navy',
    bio: 'Pushed the idea that programs could be written in readable, English-like code.',
    color: '#38b76c',
  },
  {
    username: 'alan',
    name: 'Alan Turing',
    role: 'Mathematician, Bletchley Park',
    bio: 'Formalized what it means for a problem to be computable at all.',
    color: '#5b8def',
  },
  {
    username: 'katherine',
    name: 'Katherine Johnson',
    role: 'Physicist, NASA',
    bio: 'Hand-calculated the trajectories that flew Apollo 11 to the Moon.',
    color: '#e2575c',
  },
  {
    username: 'margaret',
    name: 'Margaret Hamilton',
    role: 'Lead Software Engineer, Apollo',
    bio: 'Coined the term "software engineering" while saving a Moon landing.',
    color: '#b073e8',
  },
]

export default users
