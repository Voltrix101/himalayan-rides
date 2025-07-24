// Immersive destination data for GlassExploreCard
export interface GlassDestination {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  location: string;
}

export const glassDestinations: GlassDestination[] = [
  {
    id: 'pangong',
    title: 'Pangong Lake',
    description: `Experience the mesmerizing beauty of Pangong Tso, where crystal-clear waters stretch endlessly toward the horizon, reflecting the dramatic Himalayan peaks. This high-altitude marvel transforms from deep blue to emerald green as sunlight dances across its surface. At 4,350 meters above sea level, this pristine lake offers an otherworldly experience where silence speaks louder than words. The lake's unique brackish waters freeze completely in winter, creating a surreal ice wonderland. Journey through the legendary Chang La Pass, one of the world's highest motorable roads, as prayer flags flutter in the mountain breeze, blessing your path to this sacred destination.`,
    imageUrl: 'https://images.pexels.com/photos/1049298/pexels-photo-1049298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    videoUrl: 'https://www.youtube.com/embed/8_2kHrFv_IM',
    location: 'Ladakh, India'
  },
  {
    id: 'khardungla',
    title: 'Khardung La Pass',
    description: `Stand atop the world at Khardung La Pass, where the air is thin but the views are infinite. At 5,359 meters, this legendary mountain pass serves as the gateway to the mystical Nubra Valley. Feel the rush of conquering one of the highest motorable roads on Earth, where every breath is a victory and every moment is etched in memory. The journey winds through dramatic landscapes where ancient geology tells stories of tectonic battles. Snow-capped peaks pierce the cobalt sky while prayer flags create a colorful tapestry against the stark mountain backdrop. Here, at the roof of the world, you'll discover that some destinations change you forever.`,
    imageUrl: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    videoUrl: 'https://www.youtube.com/embed/bQVdcQKZkm4',
    location: 'Ladakh, India'
  },
  {
    id: 'nubra',
    title: 'Nubra Valley',
    description: `Enter a realm where desert meets glacier, where ancient Silk Road caravans once traversed golden sand dunes beneath towering Himalayan peaks. Nubra Valley, the "Valley of Flowers," defies imagination with its double-humped Bactrian camels grazing on dunes that seem transplanted from Arabia. Ancient monasteries cling to cliffsides like guardians of time, while hot springs bubble from the earth's depths. The valley's unique microclimate creates an oasis of green amidst the high-altitude desert, where apricot orchards bloom in defiance of the stark surroundings. Experience the magic of riding camels on sand dunes at 10,000 feet above sea level, a surreal adventure found nowhere else on Earth.`,
    imageUrl: 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    videoUrl: 'https://www.youtube.com/embed/zH4bnRNB-xM',
    location: 'Ladakh, India'
  },
  {
    id: 'tso-moriri',
    title: 'Tso Moriri',
    description: `Discover the crown jewel of the Changthang plateau, where Tso Moriri's pristine waters mirror the soul of the Himalayas. This sacred lake, cradled at 4,522 meters, serves as a sanctuary for rare black-necked cranes and a meditation ground for wandering souls. The lake's turquoise waters remain untouched by tourism's heavy hand, offering glimpses of a world where nature reigns supreme. Nomadic Changpa herders move across these ancient landscapes with their yaks and pashmina goats, following rhythms unchanged for millennia. As dawn breaks over the lake, witness a symphony of colors painting the sky while mountains stand sentinel over this last bastion of wilderness. Here, silence is profound, and every sunrise feels like the world's first.`,
    imageUrl: 'https://images.pexels.com/photos/1049298/pexels-photo-1049298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    videoUrl: 'https://www.youtube.com/embed/TK3RXCa6zQ4',
    location: 'Ladakh, India'
  },
  {
    id: 'hanle',
    title: 'Hanle Observatory',
    description: `Journey to the edge of the world where Earth meets cosmos at Hanle, home to one of the world's highest astronomical observatories. In this remote village at 4,500 meters, pristine dark skies reveal the universe in its full glory, unmarred by light pollution. The night sky here is so clear that the Milky Way appears as a brilliant river of stars flowing overhead. Ancient monasteries coexist with cutting-edge telescopes, creating a unique harmony between spiritual and scientific quests for understanding. During the day, explore vast landscapes that resemble lunar terrain, while nights offer celestial spectacles that humble the human spirit. In Hanle, you don't just observe the stars – you commune with the infinite cosmos above.`,
    imageUrl: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    videoUrl: 'https://www.youtube.com/embed/djV11Xbc914',
    location: 'Ladakh, India'
  },
  {
    id: 'changla',
    title: 'Changla Pass',
    description: `Ascend to the sacred heights of Changla Pass, where mountain gods reside among perpetual snows and prayer flags dance in the rarefied air. At 5,360 meters, this high-altitude passage connects the valleys of the soul, offering panoramic vistas that stretch beyond imagination. The pass serves as a gateway to Pangong Lake, but it's a destination worthy of reverence in its own right. Ancient trade routes wind through these heights, where every stone tells stories of brave travelers who dared to cross the roof of the world. In winter, the pass transforms into a crystalline wonderland where icicles hang like nature's chandeliers. Here, at the threshold between earth and sky, experience the profound silence that exists only in the highest places on our planet.`,
    imageUrl: 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    videoUrl: 'https://www.youtube.com/embed/8_2kHrFv_IM',
    location: 'Ladakh, India'
  }
];
