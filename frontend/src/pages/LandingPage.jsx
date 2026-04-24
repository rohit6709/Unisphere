import { Link } from 'react-router-dom';
import { LogoMarkIcon, ArrowRightIcon, CheckCircleIcon, XCircleIcon, ShieldCheckIcon, TeamIcon, ChatBubbleIcon, BellIcon, GridIcon } from '../components/icons';
import { useThemeContext } from '../context/ThemeContext.jsx';

const PAGE_CONTAINER = 'mx-auto w-full max-w-[1360px] px-5 sm:px-6 lg:px-8';

const navLinks = [
	{ href: '#about', label: 'About' },
	{ href: '#problems', label: 'Problems Solved' },
	{ href: '#features', label: 'Features' },
];

const problemPoints = [
	{
		title: 'Scattered Communication',
		description: 'Important updates are spread across chats, emails, and notice boards.',
	},
	{
		title: 'Manual Processes',
		description: 'Club operations and approvals are handled with repetitive manual work.',
	},
	{
		title: 'No Single Source of Truth',
		description: 'Students, faculty, and admins do not have one reliable platform to coordinate.',
	},
];

const featureCards = [
	{
		title: 'Smart Club Management',
		description: 'Manage members, events, and approvals with clear and structured workflows.',
		icon: <TeamIcon />,
		iconClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
	},
	{
		title: 'Real-time Chat',
		description: 'Fast communication between students, club leaders, and faculty mentors.',
		icon: <ChatBubbleIcon />,
		iconClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
	},
	{
		title: 'Timely Notifications',
		description: 'Get alerts for announcements, approvals, schedules, and important changes.',
		icon: <BellIcon />,
		iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
	},
	{
		title: 'Admin Control Panel',
		description: 'Centralized visibility and governance for departments and campus administrators.',
		icon: <GridIcon />,
		iconClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
	},
];

function Navbar() {
	return (
		<header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
			<nav className={`${PAGE_CONTAINER} flex h-20 items-center justify-between`}>
				<Link to="/" className="flex items-center gap-2.5 no-underline">
					<LogoMarkIcon />
					<span className="font-heading text-[22px] font-extrabold tracking-[-0.03em] text-slate-900 dark:text-slate-100">
						Unisphere
					</span>
				</Link>

				<div className="hidden md:flex items-center gap-8">
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className="text-[15px] font-semibold text-slate-700 no-underline transition-colors duration-200 hover:text-blue-700 dark:text-slate-200 dark:hover:text-blue-300"
						>
							{link.label}
						</a>
					))}
				</div>

				<Link
					to="/login"
					className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-[15px] font-semibold text-white no-underline transition-colors duration-200 hover:bg-blue-800"
				>
					Login <ArrowRightIcon size={16} />
				</Link>
			</nav>
		</header>
	);
}

function HeroSection() {
	return (
		<section id="about" className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.15),transparent_58%),radial-gradient(circle_at_85%_15%,rgba(20,184,166,0.14),transparent_50%)]" />

			<div className={`${PAGE_CONTAINER} relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14`}>
				<div className="lg:col-span-5 text-center lg:text-left">
					<span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300">
						Campus Collaboration Platform
					</span>

					<h1 className="mt-6 font-heading text-[clamp(40px,5.5vw,72px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-slate-900 dark:text-slate-100">
						One place to run your campus ecosystem.
					</h1>

					<p className="mt-6 text-[19px] leading-[1.65] text-slate-600 dark:text-slate-300">
						Unisphere helps students, faculty, and admins collaborate with less confusion and more speed through one unified digital workspace.
					</p>

					<div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
						<Link
							to="/login"
							className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-blue-700 px-7 py-3.5 text-[16px] font-semibold text-white no-underline transition-colors duration-200 hover:bg-blue-800"
						>
							Get Started <ArrowRightIcon size={16} />
						</Link>
						<a
							href="#features"
							className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-slate-300 px-7 py-3.5 text-[16px] font-semibold text-slate-800 no-underline transition-colors duration-200 hover:border-blue-700 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-300 dark:hover:text-blue-300"
						>
							Explore Features
						</a>
					</div>
				</div>

				<div className="lg:col-span-7">
					<div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_25px_60px_-20px_rgba(15,23,42,0.25)] dark:border-slate-800 dark:bg-slate-900">
						<img
							src="/hero-students.png"
							alt="Students using the Unisphere platform"
							className="block h-full w-full aspect-16/10 object-cover"
						/>

						<div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 rounded-2xl border border-slate-200 bg-white/90 p-4 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white">
									<ShieldCheckIcon size={22} color="white" />
								</div>
								<div>
									<p className="font-heading text-[18px] font-bold text-slate-900 dark:text-slate-100">Reliable and secure workflows</p>
									<p className="text-[14px] text-slate-600 dark:text-slate-300">Built for approvals, events, and campus-wide coordination.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function ProblemSolvedSection() {
	return (
		<section id="problems" className="py-20 md:py-24 lg:py-28">
			<div className={`${PAGE_CONTAINER} grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14`}>
				<div className="lg:col-span-5">
					<h2 className="font-heading text-[clamp(30px,4vw,46px)] font-bold leading-[1.12] tracking-[-0.02em] text-slate-900 dark:text-slate-100">
						Problems we solve for your campus
					</h2>
					<p className="mt-5 text-[18px] leading-[1.7] text-slate-600 dark:text-slate-300">
						We remove daily friction from campus operations by replacing disconnected tools with one consistent system.
					</p>
				</div>

				<div className="lg:col-span-7 grid grid-cols-1 gap-5">
					{problemPoints.map((item) => (
						<article
							key={item.title}
							className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
						>
							<div className="flex items-start gap-4">
								<XCircleIcon />
								<div>
									<h3 className="text-[20px] font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
									<p className="mt-1 text-[15px] leading-[1.65] text-slate-600 dark:text-slate-300">{item.description}</p>
								</div>
							</div>
						</article>
					))}

					<article className="rounded-2xl border border-slate-200 bg-blue-700 p-6 text-white dark:border-slate-700">
						<div className="flex items-start gap-4">
							<CheckCircleIcon color="#ffffff" />
							<div>
								<h3 className="text-[20px] font-bold">Result: Faster decisions and better student engagement</h3>
								<p className="mt-1 text-[15px] leading-[1.65] text-white/90">
									Teams spend less time coordinating tools and more time executing events, programs, and impactful initiatives.
								</p>
							</div>
						</div>
					</article>
				</div>
			</div>
		</section>
	);
}

function FeaturesSection() {
	return (
		<section id="features" className="py-20 md:py-24 lg:py-28 bg-white dark:bg-slate-900/60">
			<div className={PAGE_CONTAINER}>
				<div className="text-center">
					<h2 className="font-heading text-[clamp(30px,4vw,46px)] font-bold tracking-[-0.02em] text-slate-900 dark:text-slate-100">
						Features that make operations smooth
					</h2>
					<p className="mt-4 mx-auto max-w-3xl text-[18px] leading-[1.7] text-slate-600 dark:text-slate-300">
						Designed to improve communication, accountability, and speed across every role in your institution.
					</p>
				</div>

				<div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
					{featureCards.map((feature) => (
						<article
							key={feature.title}
							className="rounded-2xl border border-slate-200 bg-white p-7 dark:border-slate-700 dark:bg-slate-900"
						>
							<div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconClass}`}>
								{feature.icon}
							</div>
							<h3 className="mt-5 text-[21px] font-bold text-slate-900 dark:text-slate-100">{feature.title}</h3>
							<p className="mt-2 text-[15px] leading-[1.65] text-slate-600 dark:text-slate-300">{feature.description}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

function ExtraSection() {
	return (
		<section className="py-20 md:py-24 lg:py-28">
			<div className={PAGE_CONTAINER}>
				<div className="rounded-[28px] border border-slate-200 bg-white p-8 md:p-12 dark:border-slate-700 dark:bg-slate-900">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
						<div>
							<p className="text-[14px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Active clubs</p>
							<p className="mt-2 font-heading text-[44px] font-extrabold text-slate-900 dark:text-slate-100">450+</p>
						</div>
						<div>
							<p className="text-[14px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Campus users</p>
							<p className="mt-2 font-heading text-[44px] font-extrabold text-slate-900 dark:text-slate-100">12K+</p>
						</div>
						<div>
							<p className="text-[14px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400">Approval speed</p>
							<p className="mt-2 font-heading text-[44px] font-extrabold text-slate-900 dark:text-slate-100">3x</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function CTASection() {
	return (
		<section className="py-20 md:py-24 lg:py-28">
			<div className={PAGE_CONTAINER}>
				<div className="rounded-[28px] bg-blue-700 p-8 md:p-12 text-white text-center">
					<h2 className="font-heading text-[clamp(34px,4.5vw,56px)] font-extrabold tracking-[-0.02em]">
						Ready to upgrade your campus experience?
					</h2>
					<p className="mt-4 mx-auto max-w-2xl text-[18px] leading-[1.7] text-white/90">
						Start with Unisphere and bring students, faculty, and administrators into one connected and efficient system.
					</p>
					<Link
						to="/login"
						className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-[16px] font-bold text-blue-700 no-underline transition-transform duration-200 hover:-translate-y-0.5"
					>
						Start Now <ArrowRightIcon size={16} />
					</Link>
				</div>
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
			<div className={`${PAGE_CONTAINER} py-8 flex flex-col sm:flex-row items-center justify-between gap-3`}>
				<p className="text-[14px] text-slate-600 dark:text-slate-300">
					(c) {new Date().getFullYear()} Unisphere. All rights reserved.
				</p>
				<p className="text-[14px] text-slate-600 dark:text-slate-300">Built for modern education ecosystems</p>
			</div>
		</footer>
	);
}

export default function LandingPage() {
	const { theme, toggleTheme } = useThemeContext();

	return (
		<div className="min-h-screen bg-indigo-50 dark:bg-gray-900 font-sans transition-colors duration-300">
			<Navbar theme={theme} onToggleTheme={toggleTheme} />
			<main>
				<HeroSection />
				<ProblemSolvedSection />
				<FeaturesSection />
				<ExtraSection />
				<CTASection />
			</main>
			<Footer />
		</div>
	);
}

