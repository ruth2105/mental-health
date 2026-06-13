"""
Multilingual Support for Mental Health Assessment
"""

SCALE_TRANSLATIONS = {
    'en': {0: 'Not at all', 1: 'Several days', 2: 'More than half the days', 3: 'Nearly every day'},
    'amharic': {0: 'በፍፁም', 1: 'ጥቂት ቀናት', 2: 'ከግማሽ በላይ ቀናት', 3: 'ሁሉንም ቀናት'},
    'afan_oromo': {0: 'Gonkumaa', 1: 'Guyyoota muraasa', 2: 'Guyyoota walakkaa ol', 3: 'Guyyoota hunda'},
    'tigrigna': {0: 'ፈጺሙ', 1: 'ውሑዳት መዓልታት', 2: 'ካብ ፍርቂ ንላዕሊ መዓልታት', 3: 'ዳርጋ ኩሉ መዓልታት'},
    'somali': {0: 'Marnaba', 1: 'Maalmood dhowr ah', 2: 'In ka badan badhkii maalmaha', 3: 'Ku dhawaad maalin kasta'}
}

DISORDER_TRANSLATIONS = {
    'en': {
        'Anxiety': 'Anxiety', 'anexiety': 'Anxiety', 'Depression': 'Depression',
        'MDD': 'Major Depressive Disorder', 'PTSD': 'PTSD', 'ADHD': 'ADHD',
        'ASD': 'Autism Spectrum Disorder', 'Bipolar': 'Bipolar', 'bipolar': 'Bipolar',
        'OCD': 'OCD', 'PDD': 'Persistent Depressive Disorder',
        'Eating Disorder': 'Eating Disorder', 'eating disorder': 'Eating Disorder',
        'Sleeping Disorder': 'Sleeping Disorder', 'sleeping disorder': 'Sleeping Disorder',
        'Loneliness': 'Loneliness', 'Psychotic Depression': 'Psychotic Depression',
        'psychotic deprission': 'Psychotic Depression', 'Stress': 'Stress'
    },
    'amharic': {
        'Anxiety': 'የጭንቀት ችግር', 'anexiety': 'የጭንቀት ችግር', 'Depression': 'የመንፈስ ጭንቀት',
        'MDD': 'ከባድ የመንፈስ ጭንቀት', 'PTSD': 'ከድንጋጤ በኋላ የጭንቀት ችግር', 'ADHD': 'የትኩረት እጥረት ችግር',
        'ASD': 'የኦቲዝም ስፔክትረም ችግር', 'Bipolar': 'ባይፖላር ችግር', 'bipolar': 'ባይፖላር ችግር',
        'OCD': 'ተደጋጋሚ ሀሳብ እና ድርጊት ችግር', 'PDD': 'ቀጣይነት ያለው የመንፈስ ጭንቀት',
        'Eating Disorder': 'የምግብ አመጋገብ ችግር', 'eating disorder': 'የምግብ አመጋገብ ችግር',
        'Sleeping Disorder': 'የእንቅልፍ ችግር', 'sleeping disorder': 'የእንቅልፍ ችግር',
        'Loneliness': 'ብቸኝነት', 'Psychotic Depression': 'ሳይኮቲክ የመንፈስ ጭንቀት',
        'psychotic deprission': 'ሳይኮቲክ የመንፈስ ጭንቀት', 'Stress': 'ጭንቀት'
    },
    'afan_oromo': {
        'Anxiety': 'Rakkoo Yaaddoo', 'anexiety': 'Rakkoo Yaaddoo', 'Depression': 'Gadda Sammuu',
        'MDD': 'Gadda Sammuu Guddaa', 'PTSD': 'Rakkoo Yaaddoo Booda Miidhaa',
        'ADHD': 'Rakkoo Xiyyeeffannoo Dhabuu', 'ASD': 'Rakkoo Autism Spectrum',
        'Bipolar': 'Rakkoo Bipolar', 'bipolar': 'Rakkoo Bipolar',
        'OCD': 'Rakkoo Yaada fi Gocha Irra Deddeebi\'uu', 'PDD': 'Gadda Sammuu Itti Fufiinsa Qabu',
        'Eating Disorder': 'Rakkoo Nyaachuu', 'eating disorder': 'Rakkoo Nyaachuu',
        'Sleeping Disorder': 'Rakkoo Rafuu', 'sleeping disorder': 'Rakkoo Rafuu',
        'Loneliness': 'Kophummaa', 'Psychotic Depression': 'Gadda Sammuu Psychotic',
        'psychotic deprission': 'Gadda Sammuu Psychotic', 'Stress': 'Dhiphina'
    },
    'tigrigna': {
        'Anxiety': 'ጭንቀት ጸገም', 'anexiety': 'ጭንቀት ጸገም', 'Depression': 'መንፈሳዊ ጭንቀት',
        'MDD': 'ዓቢ መንፈሳዊ ጭንቀት', 'PTSD': 'ድሕሪ ድንጋጤ ጭንቀት ጸገም',
        'ADHD': 'ትኹረት ምጉዳል ጸገም', 'ASD': 'ኦቲዝም ስፔክትረም ጸገም',
        'Bipolar': 'ባይፖላር ጸገም', 'bipolar': 'ባይፖላር ጸገም',
        'OCD': 'ተደጋጋሚ ሓሳብን ተግባርን ጸገም', 'PDD': 'ቀጻሊ መንፈሳዊ ጭንቀት',
        'Eating Disorder': 'መግቢ ምብላዕ ጸገም', 'eating disorder': 'መግቢ ምብላዕ ጸገም',
        'Sleeping Disorder': 'ድቃስ ጸገም', 'sleeping disorder': 'ድቃስ ጸገም',
        'Loneliness': 'ብሕትና', 'Psychotic Depression': 'ሳይኮቲክ መንፈሳዊ ጭንቀት',
        'psychotic deprission': 'ሳይኮቲክ መንፈሳዊ ጭንቀት', 'Stress': 'ጭንቀት'
    },
    'somali': {
        'Anxiety': 'Cudurka Walwaalka', 'anexiety': 'Cudurka Walwaalka', 'Depression': 'Murugo',
        'MDD': 'Murugo Weyn', 'PTSD': 'Cudurka Walwaalka Kadib Naxdin',
        'ADHD': 'Cudurka Dareenka La\'aanta', 'ASD': 'Cudurka Autism Spectrum',
        'Bipolar': 'Cudurka Bipolar', 'bipolar': 'Cudurka Bipolar',
        'OCD': 'Cudurka Fikradaha iyo Ficillada Soo Noqnoqda', 'PDD': 'Murugo Joogto ah',
        'Eating Disorder': 'Cudurka Cuntada', 'eating disorder': 'Cudurka Cuntada',
        'Sleeping Disorder': 'Cudurka Hurdada', 'sleeping disorder': 'Cudurka Hurdada',
        'Loneliness': 'Cidlada', 'Psychotic Depression': 'Murugo Psychotic',
        'psychotic deprission': 'Murugo Psychotic', 'Stress': 'Walwaal'
    }
}

def get_disorder_translation(disorder, language='en'):
    """Get translated disorder name"""
    translations = DISORDER_TRANSLATIONS.get(language, DISORDER_TRANSLATIONS['en'])
    return translations.get(disorder, disorder)

def get_scale_translation(language='en'):
    """Get translated answer scale"""
    return SCALE_TRANSLATIONS.get(language, SCALE_TRANSLATIONS['en'])
