import { Link } from "react-router-dom";

const Footer = () => {
  // footer links
  const footerLinks = [
    {
      id: 1,
      title: "Discord",
      target: "https://discord.gg/eNehn53h8x",
    },
    {
      id: 2,
      title: "Docs",
      target:
        "https://app.gitbook.com/o/91FhSHQ1uugxQorxHEbt/s/fOF4TdLDEiXU1IzT20PE/getting-started-with-cryptocurrency/what-is-decentralized-finance",
    },
    {
      id: 3,
      title: "Github",
      target: "https://github.com/Lila-Finance",
    },
    {
      id: 4,
      title: "Medium",
      target: "https://medium.com/lila-finance",
    },
    {
      id: 5,
      title: "Twitter",
      target: "https://twitter.com/LilaFinance",
    },
  ];

  return (
    <footer className="w-full 2xl:max-w-7xl 3xl:max-w-[1400px] mx-auto py-9">
      {/* Wrapper Start */}
      <div className="flex items-center justify-between gap-4">
        {footerLinks?.map((item) => (
          <a
            href={item.target}
            key={item.id}
            target="_blank"
            rel="noopener noreferrer" // important for security reasons when using target='_blank'
            className="text-sm md:text-lg lg:text-xl"
          >
            {item.title}
          </a>
        ))}
      </div>
      {/* Wrapper End */}
    </footer>
  );
};

export default Footer;
