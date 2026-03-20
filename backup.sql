--
-- PostgreSQL database dump
--

\restrict sQUSWi1PeR9OOaBIuiEmncwqMf8AoGrWnlmNStRgluXcuJcjseeXet7G4HoeQIX

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: books; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.books (
    id integer NOT NULL,
    title text NOT NULL,
    author text DEFAULT ''::text NOT NULL,
    year text DEFAULT ''::text NOT NULL,
    genre text DEFAULT ''::text NOT NULL,
    cover_url text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    google_books_id text DEFAULT ''::text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.books OWNER TO postgres;

--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.books_id_seq OWNER TO postgres;

--
-- Name: books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;


--
-- Name: films; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.films (
    id integer NOT NULL,
    title text NOT NULL,
    year text DEFAULT ''::text NOT NULL,
    director text DEFAULT ''::text NOT NULL,
    cast_members text[] DEFAULT '{}'::text[] NOT NULL,
    genre text DEFAULT ''::text NOT NULL,
    poster_url text DEFAULT ''::text NOT NULL,
    tmdb_id integer DEFAULT 0 NOT NULL,
    media_type text DEFAULT 'movie'::text NOT NULL,
    overview text DEFAULT ''::text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.films OWNER TO postgres;

--
-- Name: films_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.films_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.films_id_seq OWNER TO postgres;

--
-- Name: films_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.films_id_seq OWNED BY public.films.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id integer NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_id_seq OWNER TO postgres;

--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: people; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.people (
    id integer NOT NULL,
    name text NOT NULL,
    photo_url text DEFAULT ''::text NOT NULL,
    known_for text DEFAULT ''::text NOT NULL,
    known_for_titles text[] DEFAULT '{}'::text[] NOT NULL,
    tmdb_id integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.people OWNER TO postgres;

--
-- Name: people_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.people_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.people_id_seq OWNER TO postgres;

--
-- Name: people_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.people_id_seq OWNED BY public.people.id;


--
-- Name: books id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);


--
-- Name: films id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.films ALTER COLUMN id SET DEFAULT nextval('public.films_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: people id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people ALTER COLUMN id SET DEFAULT nextval('public.people_id_seq'::regclass);


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.books (id, title, author, year, genre, cover_url, description, google_books_id, created_at) FROM stdin;
\.


--
-- Data for Name: films; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.films (id, title, year, director, cast_members, genre, poster_url, tmdb_id, media_type, overview, created_at) FROM stdin;
4	The Favourite	2018	Yorgos Lanthimos	{"Emma Stone","Olivia Colman","Rachel Weisz","Nicholas Hoult","Joe Alwyn","Mark Gatiss"}	History, Comedy, Drama	https://image.tmdb.org/t/p/w342/cwBq0onfmeilU5xgqNNjJAMPfpw.jpg	375262	movie	England, early 18th century. The close relationship between Queen Anne and Sarah Churchill is threatened by the arrival of Sarah's cousin, Abigail Hill, resulting in a bitter rivalry between the two cousins to be the Queen's favourite.	2026-03-16 06:38:30.905296
5	Taste of Cherry	1997	Abbas Kiarostami	{"Homayoun Ershadi","Abdolrahman Bagheri","Safar Ali Moradi","Mir Hossein Noori","Elham Imani","Afshin Khorshid Bakhtiari"}	Drama	https://image.tmdb.org/t/p/w342/u6GYH4HyR0BVwpqFuTOc2g4KB1L.jpg	30020	movie	A middle-aged Tehranian man, Mr. Badii is intent on killing himself and seeks someone to bury him after his demise. Driving around the city, the seemingly well-to-do Badii meets with numerous people, including a Muslim student, asking them to take on the job, but initially he has little luck. Eventually, Badii finds a man who is up for the task because he needs the money, but his new associate soon tries to talk him out of committing suicide.	2026-03-16 06:38:44.456072
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, title, type, metadata, created_at) FROM stdin;
6	The Catcher in the Rye	book	{"year": 1951, "genre": "Fiction", "author": "J.D. Salinger"}	2026-03-16 08:00:03.467598
7	2001: A Space Odyssey	film	{"year": 1968, "genre": "Sci-Fi", "director": "Stanley Kubrick"}	2026-03-16 08:00:03.478406
8	Dieter Rams	person	{"profession": "Industrial Designer", "nationality": "German"}	2026-03-16 08:00:03.481291
9	Dune	book	{"year": 1965, "genre": "Sci-Fi", "author": "Frank Herbert"}	2026-03-16 08:00:03.484382
10	Blade Runner 2049	film	{"year": 2017, "genre": "Sci-Fi", "director": "Denis Villeneuve"}	2026-03-16 08:00:03.487823
11	Godfather	film	{"cast": ["Upendra", "Soundarya Jayamala", "Catherine Tresa", "Ramesh Bhat", "Bhumika Chawla"], "year": "2012", "genre": "", "rating": 9.5, "tmdbId": 755450, "director": "Sethu Sriram", "overview": "A 2012 Kannada film", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/ipV6QtfFnrj80Ar2eH24gjSZHir.jpg"}	2026-03-16 08:42:34.099942
12	Blue Valentine	film	{"cast": ["Ryan Gosling", "Michelle Williams", "John Doman", "Mike Vogel", "Ben Shenkman", "Jen Jones"], "year": "2010", "genre": "Drama, Romance", "rating": 9.5, "tmdbId": 46705, "director": "Derek Cianfrance", "overview": "Dean and Cindy live a quiet life in a modest neighborhood. They appear to have the world at their feet at the outset of the relationship. However, his lack of ambition and her retreat into self-absorption cause potentially irreversible cracks in their marriage.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/dc8BdKnDY5Iy28KzUGtHIXuqqFK.jpg"}	2026-03-16 08:42:34.730479
13	Her	film	{"cast": ["Joaquin Phoenix", "Scarlett Johansson", "Lynn Adrianna", "Lisa Renee Pitts", "Gabe Gomez", "Chris Pratt"], "year": "2013", "genre": "Romance, Science Fiction, Drama", "rating": 9, "tmdbId": 152601, "director": "Spike Jonze", "overview": "In the not so distant future, Theodore, a lonely writer, purchases a newly developed operating system designed to meet the user's every need. To Theodore's surprise, a romantic relationship develops between him and his operating system. This unconventional love story blends science fiction and romance in a sweet tale that explores the nature of love and the ways that technology isolates and connects us all.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/eCOtqtfvn7mxGl6nfmq4b1exJRc.jpg"}	2026-03-16 08:42:35.123751
14	There Will Be Blood	film	{"cast": ["Daniel Day-Lewis", "Paul Dano", "Kevin J. O'Connor", "Ciarán Hinds", "Dillon Freasier", "Hope Elizabeth Reeves"], "year": "2007", "genre": "Drama", "rating": 9, "tmdbId": 7345, "director": "Paul Thomas Anderson", "overview": "Ruthless silver miner, turned oil prospector, Daniel Plainview, moves to oil-rich California. Using his son to project a trustworthy, family-man image, Plainview cons local landowners into selling him their valuable properties for a pittance. However, local preacher Eli Sunday suspects Plainview's motives and intentions, starting a slow-burning feud that threatens both their lives.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/fa0RDkAlCec0STeMNAhPaF89q6U.jpg"}	2026-03-16 08:42:35.506224
15	Monster	film	{"cast": ["Hidenobu Kiuchi", "Nozomu Sasaki", "Mamiko Noto", "Tsutomu Isobe"], "year": "2004", "genre": "Animation, Drama, Mystery, Crime", "rating": 9, "tmdbId": 30981, "director": "HIROKAZU KOREEDA", "overview": "Kenzou Tenma, a Japanese brain surgeon in Germany, finds his life in utter turmoil after getting involved with a psychopath that was once a former patient.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/n5XNKXnoXpoXyfiCtXHOf8q8PFM.jpg"}	2026-03-16 08:42:35.92391
16	The Prophet	film	{"cast": ["Leo Houlding"], "year": "2010", "genre": "Documentary", "rating": 9, "tmdbId": 459641, "director": "Alastair Lee", "overview": "The amazing story of the epic first ascent of 'The Prophet' on El Capitan, Yosemite. Following the UK's top big wall climber Leo Houlding as he revisits his 10 year project; 'The Prophet', an exceptionally steep, loose and difficult route on the east face of Yosemite's El Cap. Leo describes the route as 'the wildest climb I've ever been on'. This has to be seen to be believed, crazy climbing. Extended cut 48mins.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/uxlnBILnxeebEgDOLNSUQM3kERD.jpg"}	2026-03-16 08:42:36.326899
17	The Dark Knight	film	{"cast": ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine", "Maggie Gyllenhaal", "Gary Oldman"], "year": "2008", "genre": "Action, Crime, Thriller", "rating": 9, "tmdbId": 155, "director": "Christopher Nolan", "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg"}	2026-03-16 08:42:36.712812
18	Parasite	film	{"cast": ["Robert Glaudini", "Demi Moore", "Luca Bercovici", "James Davidson", "Al Fann", "Tom Villard"], "year": "1982", "genre": "Horror, Science Fiction", "rating": 9, "tmdbId": 48311, "director": "Charles Band", "overview": "Paul Dean has created a deadly parasite that is now attached to his stomach. He and his female companion, Patricia Welles, must find a way to destroy it while also trying to avoid Ricus & his rednecks, and an evil government agent named Merchant.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/4DGPORlVIDIQvsuSDnM4uXKMjWS.jpg"}	2026-03-16 08:42:37.127131
19	Moonlight	film	{"cast": ["Alex O'Loughlin", "Sophia Myles", "Jason Dohring", "Shannyn Sossamon"], "year": "2007", "genre": "Mystery, Crime, Drama, Sci-Fi & Fantasy", "rating": 9, "tmdbId": 5690, "director": "Ron Koslow, Trevor Munson", "overview": "Mick St. John is a captivating, charming and immortal private investigator from Los Angeles, who defies the traditional blood-sucking norms of his vampire tendencies by using his wit and powerful supernatural abilities to help the living.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/3rWk9g0Oup5WHcrpjvw5zW1WhLc.jpg"}	2026-03-16 08:42:37.506362
20	Daughters	film	{"cast": ["Ayaka Miyoshi", "Junko Abe", "Nene Otsuka", "Tomoka Kurotani", "Shingo Tsurumi", "Hisako Ôkata"], "year": "2020", "genre": "Drama", "rating": 9, "tmdbId": 739556, "director": "Hajime Tsuda", "overview": "Two women are flat-mates and friends in Tokyo. One is an event manager and the other works in the world of fashion marketing. The result shows that one is pregnant one day. The woman decides to give birth out of wedlock. It is a major decision, which is the harbinger of not just a change in their lives, but also their relationship.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/hGpxJMkXl8PxA5HTYhJkqLnxNQb.jpg"}	2026-03-16 08:42:37.923856
21	Anatomy of a Fall	film	{"cast": ["Sandra Hüller", "Swann Arlaud", "Milo Machado-Graner", "Antoine Reinartz", "Samuel Theis", "Jehnny Beth"], "year": "2023", "genre": "Thriller, Mystery, Crime", "rating": 9, "tmdbId": 915935, "director": "Justine Triet", "overview": "A woman is suspected of her husband's murder, and their blind son faces a moral dilemma as the sole witness.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/kQs6keheMwCxJxrzV83VUwFtHkB.jpg"}	2026-03-16 08:42:38.32072
22	The Bear	film	{"cast": ["Jeremy Allen White", "Ebon Moss-Bachrach", "Ayo Edebiri", "Lionel Boyce", "Abby Elliott", "Matty Matheson"], "year": "2022", "genre": "Drama, Comedy", "rating": 9, "tmdbId": 136315, "director": "Christopher Storer", "overview": "Carmy, a young fine-dining chef, comes home to Chicago to run his family sandwich shop. As he fights to transform the shop and himself, he works alongside a rough-around-the-edges crew that ultimately reveal themselves as his chosen family.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/eKfVzzEazSIjJMrw9ADa2x8ksLz.jpg"}	2026-03-16 08:42:38.734833
23	Baby Reindeer	film	{"cast": ["Richard Gadd", "Jessica Gunning", "Nava Mau"], "year": "2024", "genre": "Drama", "rating": 9, "tmdbId": 241259, "director": "Richard Gadd", "overview": "When a struggling comedian shows one act of kindness to a vulnerable woman, it sparks a suffocating obsession which threatens to wreck both their lives.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/tN9OcbkAOPwHSr1sgMornZtQZBx.jpg"}	2026-03-16 08:42:39.118017
24	Cameraperson	film	{"cast": ["Kirsten Johnson", "Jacques Derrida", "Michael Moore", "Richard Johnson"], "year": "2016", "genre": "Documentary", "rating": 9, "tmdbId": 376534, "director": "Kirsten Johnson", "overview": "As a visually radical memoir, CAMERAPERSON draws on the remarkable footage that filmmaker Kirsten Johnson has shot and reframes it in ways that illuminate moments and situations that have personally affected her. What emerges is an elegant meditation on the relationship between truth and the camera frame, as Johnson transforms scenes that have been presented on Festival screens as one kind of truth into another kind of story—one about personal journey, craft, and direct human connection.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/p1Od99QxnzCB9vKu9uxkZQlPZQ5.jpg"}	2026-03-16 08:42:39.535958
25	Close Up with The Hollywood Reporter	film	{"cast": ["Stephen Galloway", "Lacey Rose"], "year": "2015", "genre": "Talk", "rating": 9, "tmdbId": 63498, "director": "ABBAS KIAROSTAMI", "overview": "Some of this year's most talked about talent open up about the challenges and triumphs of creating critically acclaimed series and performances.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/h7X59O3T4VWVAUzZ00LEpbwA3GP.jpg"}	2026-03-16 08:42:39.932556
26	Taste of Cherry	film	{"cast": ["Homayoun Ershadi", "Abdolrahman Bagheri", "Safar Ali Moradi", "Mir Hossein Noori", "Elham Imani", "Afshin Khorshid Bakhtiari"], "year": "1997", "genre": "Drama", "rating": 9, "tmdbId": 30020, "director": "Abbas Kiarostami", "overview": "A middle-aged Tehranian man, Mr. Badii is intent on killing himself and seeks someone to bury him after his demise. Driving around the city, the seemingly well-to-do Badii meets with numerous people, including a Muslim student, asking them to take on the job, but initially he has little luck. Eventually, Badii finds a man who is up for the task because he needs the money, but his new associate soon tries to talk him out of committing suicide.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/u6GYH4HyR0BVwpqFuTOc2g4KB1L.jpg"}	2026-03-16 08:42:40.323836
27	La Haine	film	{"cast": ["Vincent Cassel", "Hubert Koundé", "Saïd Taghmaoui", "Abdel Ahmed Ghili", "Solo", "Joseph Momo"], "year": "1995", "genre": "Drama", "rating": 9, "tmdbId": 406, "director": "Mathieu Kassovitz", "overview": "After a chaotic night of rioting in a marginal suburb of Paris, three young friends, Vinz, Hubert and Saïd, wander around unoccupied waiting for news about the state of health of a mutual friend who has been seriously injured when confronting the police.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/8rgPyWjYZhsphSSxbXguMnhN7H0.jpg"}	2026-03-16 08:42:40.720104
28	The Dark Knight Rises	film	{"cast": ["Christian Bale", "Gary Oldman", "Tom Hardy", "Joseph Gordon-Levitt", "Anne Hathaway", "Marion Cotillard"], "year": "2012", "genre": "Action, Crime, Drama, Thriller", "rating": 8.5, "tmdbId": 49026, "director": "Christopher Nolan", "overview": "Following the death of District Attorney Harvey Dent, Batman assumes responsibility for Dent's crimes to protect the late attorney's reputation and is subsequently hunted by the Gotham City Police Department. Eight years later, Batman encounters the mysterious Selina Kyle and the villainous Bane, a new terrorist leader who overwhelms Gotham's finest. The Dark Knight resurfaces to protect a city that has branded him an enemy.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg"}	2026-03-16 08:42:41.149615
29	Oppenheimer	film	{"cast": ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr.", "Florence Pugh", "Josh Hartnett"], "year": "2023", "genre": "Drama, History", "rating": 8.5, "tmdbId": 872585, "director": "Christopher Nolan", "overview": "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"}	2026-03-16 08:42:41.574223
30	Loveless	film	{"cast": ["Katsuyuki Konishi", "Junko Minagawa", "Jun Fukuyama", "Hiroki Takahashi"], "year": "2005", "genre": "Animation, Drama, Mystery", "rating": 8.5, "tmdbId": 21998, "director": "ANDREY ZVYAGINTSEV", "overview": "Twelve-year old Aoyagi Ritsuka is left with his insane mother as his only family when his brother, Seimei, is killed suddenly. After moving to a new school, he meets Agatsuma Soubi, who claims to have known his brother. Ritsuka eventually discovers that Soubi and Seimei used to be a fighting pair, whereby Soubi was the \\"Fighter\\" and Seimei was the \\"Sacrifice\\". Now that Seimei is gone, Ritsuka has inherited Soubi, who will become his \\"Fighter\\". After learning that Seimei was killed by an organisation known as the \\"Seven Moons\\", Ritsuka decides to investigate into his brother's death, with the sometimes useless help of Soubi, along the way.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/tyVjSxK1DNJcartGLY0pbiPtBtN.jpg"}	2026-03-16 08:42:41.966169
31	Kolchak: The Night Stalker	film	{"cast": ["Darren McGavin", "Simon Oakland", "Jack Grinnage"], "year": "1974", "genre": "Drama, Mystery, Sci-Fi & Fantasy", "rating": 8.5, "tmdbId": 5084, "director": "Jeffrey Grant Rice", "overview": "Kolchak: The Night Stalker is an American television series that aired on ABC during the 1974–1975 season. It featured a fictional Chicago newspaper reporter who investigated mysterious crimes with unlikely causes, particularly those that law enforcement authorities would not follow up. These often involved the supernatural or even science fiction, including fantastic creatures.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/lgP91rWAjgqvA7IzwG3R96sAU8K.jpg"}	2026-03-16 08:42:42.357894
32	Biutiful	film	{"cast": ["Javier Bardem", "Maricel Álvarez", "Hanaa Bouchaib", "Guillermo Estrella", "Eduard Fernández", "Cheikh Ndiaye"], "year": "2010", "genre": "Drama", "rating": 8.5, "tmdbId": 45958, "director": "Alejandro González Iñárritu", "overview": "This is a story of a man in free fall. On the road to redemption, darkness lights his way. Connected with the afterlife, Uxbal is a tragic hero and father of two who's sensing the danger of death. He struggles with a tainted reality and a fate that works against him in order to forgive, for love, and forever.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/4BLshBMp8INRDhvfuKwxMlHDIIt.jpg"}	2026-03-16 08:42:42.738475
33	Secret Lives	film	{"cast": [], "year": "1999", "genre": "Soap, Drama", "rating": 8.5, "tmdbId": 14610, "director": "Jason Daniel, Anne Harris, Greg Stevens", "overview": "Salatut elämät (Secret Lives) is a Finnish television soap opera that premiered on MTV3 on 25 January 1999. The series' storylines follow the daily lives of several families who live in the same apartment block in Helsinki.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/ugYAGyxwajuplDUUYT8Bzbj8eNR.jpg"}	2026-03-16 08:42:43.1189
34	Memories of Murder	film	{"cast": ["Song Kang-ho", "Kim Sang-kyung", "Kim Roi-ha", "Song Jae-ho", "Byun Hee-bong", "Go Seo-hee"], "year": "2003", "genre": "Crime, Drama, Thriller", "rating": 8.5, "tmdbId": 11423, "director": "Bong Joon Ho", "overview": "A sadistic serial rapist and murderer of young women terrorizes a small province in 1980s South Korea. To prevent further crimes, three increasingly desperate detectives with conflicting methods race against time to unravel the violent mind of the killer in a futile effort to solve the case.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/dsEoTJKM1s5OVDkS2P2JdoTxo4K.jpg"}	2026-03-16 08:42:43.532872
35	The Watchmen	film	{"cast": [], "year": "2017", "genre": "", "rating": 8.5, "tmdbId": 433354, "director": "Fern Silva", "overview": "In The Watchmen, pulsating orbs, panopticons, roadside rest stops, and subterranean labyrinths confront the scope of human consequences and the entanglement of our seeking bodies.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/5hjcLRoK68oTwFRq07feVCASZnh.jpg"}	2026-03-16 08:42:43.948386
36	The Underground Railroad	film	{"cast": ["Thuso Mbedu", "Chase W. Dillon", "Joel Edgerton"], "year": "2021", "genre": "Drama, Sci-Fi & Fantasy", "rating": 8.5, "tmdbId": 80039, "director": "Barry Jenkins", "overview": "Follow young Cora’s journey as she makes a desperate bid for freedom in the antebellum South. After escaping her Georgia plantation for the rumored Underground Railroad, Cora discovers no mere metaphor, but an actual railroad full of engineers and conductors, and a secret network of tracks and tunnels beneath the Southern soil.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/CrrTqw7LHafnbdH9UcK60aOZSm.jpg"}	2026-03-16 08:42:44.413432
37	Stranger Things	film	{"cast": ["Winona Ryder", "David Harbour", "Millie Bobby Brown", "Finn Wolfhard", "Gaten Matarazzo", "Caleb McLaughlin"], "year": "2016", "genre": "Sci-Fi & Fantasy, Mystery, Action & Adventure", "rating": 8.5, "tmdbId": 66732, "director": "Ross Duffer, Matt Duffer", "overview": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg"}	2026-03-16 08:42:44.793664
38	Succession	film	{"cast": ["Jeremy Strong", "Kieran Culkin", "Sarah Snook", "Brian Cox", "Matthew Macfadyen", "Alan Ruck"], "year": "2018", "genre": "Drama, Comedy", "rating": 8.5, "tmdbId": 76331, "director": "Jesse Armstrong", "overview": "Follow the lives of the Roy family as they contemplate their future once their aging father begins to step back from the media and entertainment conglomerate they control.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/z0XiwdrCQ9yVIr4O0pxzaAYRxdW.jpg"}	2026-03-16 08:42:45.172827
39	The Last Dance	film	{"cast": ["Michael Jordan", "Scottie Pippen", "Dennis Rodman", "Phil Jackson", "Steve Kerr"], "year": "2020", "genre": "Documentary", "rating": 8.5, "tmdbId": 79525, "director": "Michael Tollin", "overview": "A 10-part documentary chronicling the untold story of Michael Jordan and the Chicago Bulls dynasty with rare, never-before-seen footage and sound from the 1997-98 championship season – plus over 100 interviews with famous figures and basketball’s biggest names.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/oVf4xGGbDtwVHiKn8uTuSriY7PH.jpg"}	2026-03-16 08:42:45.548429
40	No Country for Old Men	film	{"cast": ["Javier Bardem", "Tommy Lee Jones", "Josh Brolin", "Woody Harrelson", "Kelly Macdonald", "Garret Dillahunt"], "year": "2007", "genre": "Crime, Thriller, Western", "rating": 8.5, "tmdbId": 6977, "director": "Joel Coen", "overview": "Llewelyn Moss stumbles upon dead bodies, $2 million and a hoard of heroin in a Texas desert, but methodical killer Anton Chigurh comes looking for it, with local sheriff Ed Tom Bell hot on his trail. The roles of prey and predator blur as the violent pursuit of money and justice collide.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/6d5XOczc226jECq0LIX0siKtgHR.jpg"}	2026-03-16 08:42:45.928838
41	The Lobster	film	{"cast": ["Colin Farrell", "Rachel Weisz", "Olivia Colman", "Léa Seydoux", "Michael Smiley", "Ariane Labed"], "year": "2015", "genre": "Comedy, Drama, Romance", "rating": 8, "tmdbId": 254320, "director": "Yorgos Lanthimos", "overview": "In a dystopian near future, single people, according to the laws of The City, are taken to The Hotel, where they are obliged to find a romantic partner in forty-five days or are transformed into animals and sent off into The Woods.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/7Y9ILV1unpW9mLpGcqyGQU72LUy.jpg"}	2026-03-16 08:42:46.354207
42	The Favourite	film	{"cast": ["Emma Stone", "Olivia Colman", "Rachel Weisz", "Nicholas Hoult", "Joe Alwyn", "Mark Gatiss"], "year": "2018", "genre": "History, Comedy, Drama", "rating": 8, "tmdbId": 375262, "director": "Yorgos Lanthimos", "overview": "England, early 18th century. The close relationship between Queen Anne and Sarah Churchill is threatened by the arrival of Sarah's cousin, Abigail Hill, resulting in a bitter rivalry between the two cousins to be the Queen's favourite.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/cwBq0onfmeilU5xgqNNjJAMPfpw.jpg"}	2026-03-16 08:42:46.742345
43	Close your Eyes	film	{"cast": ["Thaleia Matika", "Doretta Papadimitriou", "Ioanna Pappa", "Aimilios Heilakis", "Aris Servetalis", "Christos Loulis"], "year": "2003", "genre": "Drama", "rating": 8, "tmdbId": 51081, "director": "Christopher Papakaliatis", "overview": "Two friends who study in London come back to Greece for their vacation. Fillipos, one of them, falls for a married woman. Soon he meets her daughter who also studies in London and the mix up begins.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/shHlUPyL9qT7TBCXfgvTeUwO9nS.jpg"}	2026-03-16 08:42:47.120856
44	2001: A Space Odyssey	film	{"cast": ["Keir Dullea", "Gary Lockwood", "William Sylvester", "Douglas Rain", "Daniel Richter", "Leonard Rossiter"], "year": "1968", "genre": "Science Fiction, Mystery, Adventure", "rating": 8, "tmdbId": 62, "director": "Stanley Kubrick", "overview": "Humanity finds a mysterious object buried beneath the lunar surface and sets off to find its origins with the help of HAL 9000, the world's most advanced super computer.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg"}	2026-03-16 08:42:47.501582
45	Drive My Car	film	{"cast": ["Hidetoshi Nishijima", "Toko Miura", "Masaki Okada", "Reika Kirishima", "Park Yu-rim", "Jin Dae-yeon"], "year": "2021", "genre": "Drama", "rating": 8, "tmdbId": 758866, "director": "Ryusuke Hamaguchi", "overview": "Yusuke Kafuku, a stage actor and director, still unable, after two years, to cope with the loss of his beloved wife, accepts to direct Uncle Vanya at a theater festival in Hiroshima. There he meets Misaki, an introverted young woman, appointed to drive his car. In between rides, secrets from the past and heartfelt confessions will be unveiled.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/a2lxHS6Au35k5XtFQEQW44yWHeH.jpg"}	2026-03-16 08:42:47.920122
46	Marriage Story	film	{"cast": ["Adam Driver", "Scarlett Johansson", "Laura Dern", "Alan Alda", "Ray Liotta", "Julie Hagerty"], "year": "2019", "genre": "Drama", "rating": 8, "tmdbId": 492188, "director": "Noah Baumbach", "overview": "A stage director and an actress struggle through a grueling, coast-to-coast divorce that pushes them to their personal extremes.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/2JRyCKaRKyJAVpsIHeLvPw5nHmw.jpg"}	2026-03-16 08:42:48.302447
47	Under the Open Sky	film	{"cast": ["Koji Yakusho", "Taiga Nakano", "Masami Nagasawa", "Isao Hashizume", "Rokkaku Seiji", "Yukiya Kitamura"], "year": "2021", "genre": "Crime, Drama", "rating": 8, "tmdbId": 728882, "director": "Miwa Nishikawa", "overview": "Mikami, an ex-yakuza of middle age with most of his life in prison, gets released after serving 13 years of sentence for murder. Hoping to find his long lost mother, from whom he was separated as a child, he applies for a TV show and meets a young TV director Tsunoda. Meanwhile, he struggles to get a proper job and fit into society. His impulsive, adamant nature and ingrained beliefs cause friction in his relationship with Tsunoda and those who want to help him.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/niXZ7He4YQywfFMVdo6uI6GeaOD.jpg"}	2026-03-16 08:42:48.715266
48	In Bruges	film	{"cast": ["Colin Farrell", "Brendan Gleeson", "Ralph Fiennes", "Clémence Poésy", "Thekla Reuten", "Jordan Prentice"], "year": "2008", "genre": "Comedy, Drama, Crime", "rating": 8, "tmdbId": 8321, "director": "Martin McDonagh", "overview": "Ray and Ken, two hit men, are in Bruges, Belgium, waiting for their next mission. While they are there they have time to think and discuss their previous assignment. When the mission is revealed to Ken, it is not what he expected.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/vz3Vd6nfq9YZrVvyYx5RHFaYKV3.jpg"}	2026-03-16 08:42:49.095092
49	Shoplifters	film	{"cast": ["Charles Sah", "Chiew Zi Xing"], "year": "2023", "genre": "Comedy, Drama", "rating": 8, "tmdbId": 1391581, "director": "Darwish Syahmi", "overview": "A spirited 7-year-old, inspired by cartoon heists, ropes his older brother into an audacious plan to swipe candy but the adventure leads to unexpected lessons about family, guilt and second chances.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/xRv3FbRpbaRm7xW4JGVZEXxmHTv.jpg"}	2026-03-16 08:42:49.512117
50	I, Daniel Blake	film	{"cast": ["Dave Johns", "Hayley Squires", "Briana Shann", "Dylan McKiernan", "Kate Rutter", "Sharon Percy"], "year": "2016", "genre": "Drama", "rating": 8, "tmdbId": 374473, "director": "Ken Loach", "overview": "A middle aged carpenter, who requires state welfare after injuring himself, is joined by a single mother in a similar scenario.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/nu3WVABXz2W85N6JXTZOT1aWS3b.jpg"}	2026-03-16 08:42:49.928213
51	Rust and Bone	film	{"cast": ["Marion Cotillard", "Matthias Schoenaerts", "Armand Verdure", "Céline Sallette", "Corinne Masiero", "Bouli Lanners"], "year": "2012", "genre": "Drama, Romance", "rating": 8, "tmdbId": 97365, "director": "Jacques Audiard", "overview": "Put in charge of his young son, Ali leaves Belgium for Antibes to live with his sister and her husband as a family. Ali's bond with Stephanie, a killer whale trainer, grows deeper after Stephanie suffers a horrible accident.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/6bcerd7CeQ5y5Dilym1O2C8c8Gl.jpg"}	2026-03-16 08:42:50.34757
52	Interstellar	film	{"cast": ["Matthew McConaughey", "Anne Hathaway", "Michael Caine", "Jessica Chastain", "Casey Affleck", "Wes Bentley"], "year": "2014", "genre": "Adventure, Drama, Science Fiction", "rating": 8, "tmdbId": 157336, "director": "Christopher Nolan", "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"}	2026-03-16 11:31:14.203124
53	Synecdoche, New York	film	{"cast": ["Philip Seymour Hoffman", "Samantha Morton", "Michelle Williams", "Catherine Keener", "Emily Watson", "Dianne Wiest"], "year": "2008", "genre": "Drama", "rating": 8, "tmdbId": 4960, "director": "Charlie Kaufman", "overview": "A theater director struggles with his work, and the women in his life, as he attempts to create a life-size replica of New York inside a warehouse as part of his new play.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/5UwdhrjXhUgsiDhe1dpS9z4yj7q.jpg"}	2026-03-16 11:31:14.823839
54	The Salesman	film	{"cast": ["Ian Holm", "Priscilla Morgan"], "year": "1970", "genre": "", "rating": 8, "tmdbId": 1606261, "director": "Herbert Wise", "overview": "A woman regrets inviting a salesman into her home. He's not selling any goods, just an unusual service.", "mediaType": "movie", "posterUrl": ""}	2026-03-16 11:31:15.215285
55	A Separation	film	{"cast": ["Michelle Sun", "Zhen Yao", "Carlee Soeder"], "year": "2019", "genre": "Drama", "rating": 8, "tmdbId": 703731, "director": "Yalan Hu", "overview": "On a warm autumn day in 1990, Huixian, a young Chinese woman, arrives in Florida to reunite with her PhD husband, after a four-year separation. Filled with blossoming hope and desire, she is introduced to another side of American life.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/fmngHGvRYC9wT3nEFOcVsXGp9pH.jpg"}	2026-03-16 11:31:15.636674
56	Ex Machina	film	{"cast": ["Domhnall Gleeson", "Alicia Vikander", "Oscar Isaac", "Sonoya Mizuno", "Corey Johnson", "Claire Selby"], "year": "2015", "genre": "Drama, Science Fiction", "rating": 8, "tmdbId": 264660, "director": "Alex Garland", "overview": "Caleb, a coder at the world's largest internet company, wins a competition to spend a week at a private mountain retreat belonging to Nathan, the reclusive CEO of the company. But when Caleb arrives at the remote location he finds that he will have to participate in a strange and fascinating experiment in which he must interact with the world's first true artificial intelligence, housed in the body of a beautiful robot girl.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/dmJW8IAKHKxFNiUnoDR7JfsK7Rp.jpg"}	2026-03-16 11:31:16.024778
57	Birdman	film	{"cast": [], "year": "2015", "genre": "Documentary", "rating": 8, "tmdbId": 435092, "director": "Guy Bolongaro", "overview": "A portrait of Robert, a troubled but poetic soul struggling with his purgatorial existence in a hackney scrapyard.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/9n0u3Ee7OUjgeyF5kIwahxkf4xm.jpg"}	2026-03-16 11:31:16.428536
58	The Great Beauty	film	{"cast": ["Toni Servillo", "Carlo Verdone", "Sabrina Ferilli", "Carlo Buccirosso", "Iaia Forte", "Pamela Villoresi"], "year": "2013", "genre": "Drama", "rating": 8, "tmdbId": 179144, "director": "Paolo Sorrentino", "overview": "Jep Gambardella has seduced his way through the lavish nightlife of Rome for decades, but after his 65th birthday and a shock from the past, Jep looks past the nightclubs and parties to find a timeless landscape of absurd, exquisite beauty.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/1cmOc3ZPkuCTOTqHEsRr3Pk81Um.jpg"}	2026-03-16 11:31:16.848357
59	To Kill a Tiger	film	{"cast": [], "year": "2023", "genre": "Documentary", "rating": 8, "tmdbId": 1015356, "director": "Nisha Pahuja", "overview": "Ranjit, a farmer in India, takes on the fight of his life when he demands justice for his 13-year-old daughter, the victim of a brutal gang rape. His decision to support his daughter is virtually unheard of, and his journey unprecedented.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/qxzaYYRAH6gZoyJlnajCvYeL6Ms.jpg"}	2026-03-16 11:31:17.233973
60	Time	film	{"cast": ["Bella Ramsey", "Siobhan Finneran", "Jodie Whittaker", "Tamara Lawrance", "James Nelson-Joyce"], "year": "2021", "genre": "Drama", "rating": 8, "tmdbId": 126116, "director": "Jimmy McGovern", "overview": "Guilt, violence and impossible choices – what does it take to survive? Tense, gritty and heartbreaking – Jimmy McGovern's award-winning prison drama, with an all-star cast.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/mhi7oohUBIufTjF9u41uMXYHsw2.jpg"}	2026-03-16 11:31:17.658361
61	Save Me	film	{"cast": ["Um Tae-goo", "Cheon Ho-jin", "Esom", "Kim Young-min", "Im Ha-ryong", "Oh Yeon-ah"], "year": "2017", "genre": "Crime, Comedy, Drama", "rating": 8, "tmdbId": 72690, "director": "Jung Yi-do", "overview": "Save Me is a web-toon based thriller drama with a story of four young men who try to save one woman. One day, they face a woman in a dark alley who asks for their help. The woman turns out to be involved in a cult group. A sequence of horrifying tension-filled events follow the four young men.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/bNbrGcMxClqvSLZo7OwkRn5jEmv.jpg"}	2026-03-16 11:31:18.043251
62	Severance	film	{"cast": ["Adam Scott", "Britt Lower", "Tramell Tillman", "Zach Cherry", "Jen Tullock", "Dichen Lachman"], "year": "2022", "genre": "Drama, Mystery, Sci-Fi & Fantasy", "rating": 8, "tmdbId": 95396, "director": "Dan Erickson", "overview": "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg"}	2026-03-16 11:31:18.43642
63	Inglourious Basterds	film	{"cast": ["Brad Pitt", "Mélanie Laurent", "Christoph Waltz", "Eli Roth", "Michael Fassbender", "Diane Kruger"], "year": "2009", "genre": "Drama, Thriller, War", "rating": 8, "tmdbId": 16869, "director": "Quentin Tarantino", "overview": "In Nazi-occupied France during World War II, a group of Jewish-American soldiers known as \\"The Basterds\\" are chosen specifically to spread fear throughout the Third Reich by scalping and brutally killing Nazis. The Basterds, lead by Lt. Aldo Raine soon cross paths with a French-Jewish teenage girl who runs a movie theater in Paris which is targeted by the soldiers.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg"}	2026-03-16 11:31:18.850075
64	Good Time	film	{"cast": ["Robert Pattinson", "Benny Safdie", "Buddy Duress", "Taliah Webster", "Jennifer Jason Leigh", "Barkhad Abdi"], "year": "2017", "genre": "Crime, Thriller, Drama", "rating": 8, "tmdbId": 429200, "director": "Josh Safdie", "overview": "After a botched bank robbery lands his younger brother in prison, Connie Nikas embarks on a twisted odyssey through New York City's underworld to get his brother Nick out of jail.", "mediaType": "movie", "posterUrl": "https://image.tmdb.org/t/p/w342/yE1c9hj5Hf8a9KplAdRdhADqUro.jpg"}	2026-03-16 11:31:19.26683
65	Mo	film	{"cast": ["Mo Amer", "Teresa Ruiz", "Farah Bsieso", "Omar Elba"], "year": "2022", "genre": "Comedy, Drama", "rating": 8, "tmdbId": 201124, "director": "Mo Amer, Ramy Youssef", "overview": "In Texas, Mo straddles the line between two cultures, three languages and a pending asylum request while hustling to support his Palestinian family.", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/x3ojdK36AKestQaL2nAE6A7JYWO.jpg"}	2026-03-16 11:31:19.682944
66	Adolescence	film	{"cast": [], "year": "2025", "genre": "Drama, Crime", "rating": 8, "tmdbId": 249042, "director": "Stephen Graham, Jack Thorne", "overview": "When a 13-year-old is accused of the murder of a classmate, his family, therapist and the detective in charge are all left asking: what really happened?", "mediaType": "tv", "posterUrl": "https://image.tmdb.org/t/p/w342/20i4nShZZg1g1VFHSB8xpaYM4r7.jpg"}	2026-03-16 11:31:20.097531
\.


--
-- Data for Name: people; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.people (id, name, photo_url, known_for, known_for_titles, tmdb_id, created_at) FROM stdin;
1	Abbas Kiarostami	https://image.tmdb.org/t/p/w185/rTlz5ciu41FxyVuXA82a3tSYVZ8.jpg	Directing	{"Taste of Cherry",Close-Up,"Certified Copy"}	119294	2026-03-16 00:21:51.79583
\.


--
-- Name: books_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.books_id_seq', 1, true);


--
-- Name: films_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.films_id_seq', 5, true);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_id_seq', 66, true);


--
-- Name: people_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.people_id_seq', 1, true);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: films films_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.films
    ADD CONSTRAINT films_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: people people_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict sQUSWi1PeR9OOaBIuiEmncwqMf8AoGrWnlmNStRgluXcuJcjseeXet7G4HoeQIX

