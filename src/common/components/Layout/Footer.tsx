import Image from "next/image";

const Footer = () => {
  return (
    <footer className="flex justify-start justify-self-end pb-4 mt-16 w-full h-auto border-t shadow-lg align-center border-color-mode footer">
      <div className="flex flex-col m-auto space-y-1 w-full text-center">
        {/* light mode */}
        <div className="flex relative mx-0 mt-4 h-20 dark:hidden">
          <Image
            src="/logo_full_light.png"
            alt=""
            layout="fill"
            objectFit="contain"
          />
        </div>
        {/* dark mode */}
        <div className="hidden relative mr-0 ml-0 h-24 dark:flex">
          <Image
            src="/logo_full_dark.png"
            alt=""
            layout="fill"
            objectFit="contain"
          />
        </div>
        <a
          className=""
          href="https://info.daobi.org/court/"
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          DAObi Homepage
        </a>
        <a
          className=""
          href="https://twitter.com/DaobiTreasury"
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          Twitter
        </a>
        <a
          className=""
          href="https://discord.com/invite/HqvVRPZ9Gg"
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          Discord
        </a>
        <a
          className=""
          href="https://github.com/bluentity/daobi"
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          Contract Source Code
        </a>
      </div>
    </footer>
  );
};

export default Footer;
