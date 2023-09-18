import style from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={style.footer}>
      <p className={style.copyright}>
        &copy; Copyright {new Date().getFullYear()} by WorldWise
      </p>
    </footer>
  );
}
