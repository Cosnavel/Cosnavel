export const colors = {
  ink: '#0B0B0C',
  gold: '#CFB075',
  goldLight: '#F3E1B8',
  goldPale: '#E7CC93',
  goldDeep: '#A38252',
  goldDark: '#8F6A31',
  silver: '#C9D1D9',
  muted: '#8B949E',
  hairline: '#3A2F1C',
  white: '#F5F5F5',
};

// Metallic stops taken from the Kettner Edelmetalle logo gradients.
export const goldStops = [
  [0, '#E7CC93'],
  [0.12, '#CFB075'],
  [0.3, '#A38252'],
  [0.5, '#E7CC93'],
  [0.58, '#F6E1B8'],
  [0.66, '#E0C693'],
  [0.8, '#CEAE73'],
  [1, '#9E7D4D'],
];

export const silverStops = [
  [0, '#C9C9C9'],
  [0.3, '#EDEDED'],
  [0.55, '#FFFFFF'],
  [0.8, '#DDDDDD'],
  [1, '#BDBDBD'],
];

export function stops(list) {
  return list
    .map(([offset, color, opacity]) =>
      `<stop offset="${offset}" stop-color="${color}"${opacity === undefined ? '' : ` stop-opacity="${opacity}"`}/>`,
    )
    .join('');
}
