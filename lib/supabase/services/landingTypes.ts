export type ContactProp = {
  telefon: string;

  email: string;

  facebook_url?: string;

  instagram_url?: string;

  tiktok_url?: string;
};

export type ProjectProp = {
  id: string;

  title: string;

  description?: string;

  image?: string;

  created_at: string;
};

export type PriceProp = {
  id: string;
  title: string;
  price: string;
  text_1?: string;
  text_2?: string;
  text_3?: string;
  text_4?: string;
  text_5?: string;
};
