const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "",
    pass: "",
  },
});

const destinatarios = ["test@gmail.com"];

const enviarCorreoIndividual = async (destinatario) => {
  const mensajeFrances = {
    from: "", // Poner correo
    to: destinatario,
    subject: "Activation de votre utilisateur - Nouveau Intranet CIOFF®",
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <p>Chers membres,</p>
        <p>Nous espérons que ce courriel vous trouvera en bonne santé et que vous avez passé une excellente saison de festivals.</p>

        <p>Comme approuvé lors de la dernière Assemblée Générale en Croatie, nous sommes heureux de vous présenter la première ébauche du nouvel intranet qui sera lancé avec le nouveau site Web en janvier 2025.</p>
        <p>Ce courriel a pour but de vous informer du processus d'activation de votre nouvel utilisateur et de début d'inscription de vos festivals et groupes, afin qu'ils puissent commencer à remplir leur profil qui sera public sur le site Web.</p>

        <p>Ce n’est pas une version terminée; nous travaillons encore sur certains détails comme les traductions et les questionnaires, alors ne vous en souciez pas encore.</p>

        <p>N'oubliez pas qu'à partir de maintenant, les festivals et les groupes sont propriétaires de leurs propres informations de profil, mais que vous, en tant que NS, êtes propriétaire de leurs utilisateurs. La première étape consiste maintenant à enregistrer les festivals et les groupes afin que leurs utilisateurs soient activés, puis ils recevront un courriel d'activation pour commencer à remplir leur profil. Nous vous demandons de remplir ces informations au plus tard le <b>25 octobre</b> afin que nous puissions prendre ces informations en compte lors de la présentation du nouveau site Web lors de l'Assemblée Générale.</p>

        <p>Vous avez ici vos informations de connexion:</p>
        <ul>
          <li><strong>Nom d'utilisateur:</strong> ${destinatario}</li>
          <li><strong>Mot de passe:</strong>Contraseña</li>
          <li><strong>Lien de connexion:</strong> <a href="https://webpage-cioff.vercel.app/login" target="_blank">https://webpage-cioff.vercel.app/login</a></li>
          <li><strong>Vidéo:</strong> <a href="https://drive.google.com/file/d/1a1cet0QeZEoUm56fEkgw3nCgL2RLTazX/view?usp=drive_link" target="_blank">Didacticiel vidéo</a></li>
        </ul>

        <p>Nous organisons des réunions sectorielles afin de pouvoir répondre à toutes vos questions. N'hésitez pas à nous contacter si vous avez besoin de résoudre quelque chose au préalable.</p>

        <p>Cordialement,</p>
        <p><strong>Commission des Communications du CIOFF®</strong></p>
      </div>
    `,
  };

  const mensajeIngles = {
    from: "",
    to: destinatario,
    subject: "Activate Your User - New CIOFF® Intranet",
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <p>Dear members,</p>
        <p>Hoping this email finds you well and you had an amazing festival season.</p>

        <p>As approved in the last General Assembly in Croatia, we are happy to present the first draft of the new intranet that will be launched with the new website in January 2025.</p>
        <p>This email is to inform you about the process to activate your new user and start registering your festivals and groups, so they can start filling out their profile that will be public on the website.</p>

        <p>This is not a finished version; we are still working on some details like translations and questionnaires, so please don’t worry about it yet.</p>

        <p>Please remember that, from now on, festivals and groups are owners of their own profile information, but you as NS are owners of their users. The first step now is for you to register festivals and groups so their users will be activated, and then they will receive an activation email to start filling their profile. We ask you to fill this information no later than <b>October 25th</b> so we are able to take these inputs to the presentation of the new website during the General Assembly.</p>

        <p>Here you have your login information:</p>
        <ul>
          <li><strong>User:</strong> ${destinatario}</li>
          <li><strong>Password:</strong>Contraseña</li>
          <li><strong>Log in link:</strong> <a href="https://webpage-cioff.vercel.app/login" target="_blank">https://webpage-cioff.vercel.app/login</a></li>
          <li><strong>Video:</strong> <a href="https://drive.google.com/file/d/1h3wfnwKTDOcN8Hswvt0OfcopmEIksMR-/view?usp=drive_link" target="_blank">Video tutorial</a></li>
        </ul>

        <p>We are arranging sector meetings so we can solve any questions you may have. Don’t hesitate to contact us if you need to solve something beforehand.</p>

        <p>Best regards,</p>
        <p><strong>CIOFF® Communications Commission</strong></p>
      </div>
    `,
  };

  const mensaje = {
    from: "",
    to: destinatario,
    subject: "Activación de su usuario - Nueva intranet CIOFF®",
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <p>Estimados miembros,</p>
        <p>Esperamos que este correo les encuentre bien y que hayan tenido una temporada de festivales increíble.</p>

        <p>Como se aprobó en la última Asamblea General en Croacia, estamos felices de presentarles el primer borrador de la nueva intranet que se lanzará con el nuevo sitio web en enero de 2025.</p>
        <p>Este correo es para informarles sobre el proceso para activar su nuevo usuario y comenzar a registrar sus festivales y grupos, para que estos a su vez puedan comenzar a completar su perfil que será público en el sitio web.</p>

        <p>Esta no es una versión terminada, todavía estamos trabajando en algunos detalles como traducciones y cuestionarios, así que no se preocupen por eso todavía.</p>

        <p>Recuerden que, a partir de ahora, los festivales y grupos son dueños de su propia información de perfil, pero ustedes como SN son dueños de sus usuarios. El primer paso ahora es que ustedes registren sus festivales y grupos para que sus usuarios sean activados, y luego ellos recibirán un correo electrónico de activación para comenzar a completar su perfil. Les pedimos que completen esta información a más tardar el <b>25 de octubre</b> para que podamos llevar estos insumos a la presentación del nuevo sitio web durante la Asamblea General.</p>

        <p>Aquí encuentra su información de acceso:</p>
        <ul>
          <li><strong>Usuario:</strong> ${destinatario}</li>
          <li><strong>Contraseña:</strong>Contraseña</li>
          <li><strong>Inicio de sesión:</strong> <a href="https://webpage-cioff.vercel.app/login" target="_blank">https://webpage-cioff.vercel.app/login</a></li>
          <li><strong>Video:</strong> <a href="https://drive.google.com/file/d/1t8H_-MzQ9vbn7sWbM153nv9o64hUgJwN/view?usp=drive_link" target="_blank">Tutorial de video</a></li>
        </ul>

        <p>Estamos organizando reuniones por sector para poder resolver cualquier duda que tengan. No duden en contactarnos si necesitan resolver algo con antelación.</p>

        <p>Un cordial saludo,</p>
        <p><strong>Comisión de Comunicaciones de CIOFF®</strong></p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mensaje);
    console.log(`Correo enviado con éxito a ${destinatario}:`, info.response);
  } catch (error) {
    console.log(`Error al enviar el correo a ${destinatario}:`, error);
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const enviarCorreosConDelay = async () => {
  for (const destinatario of destinatarios) {
    await enviarCorreoIndividual(destinatario);
    await delay(500);
  }
};

enviarCorreosConDelay();
