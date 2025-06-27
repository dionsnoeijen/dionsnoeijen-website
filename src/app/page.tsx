// app/cv/page.tsx

export default function CVPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-base leading-relaxed">
      <h1 className="text-3xl font-bold mb-4">Dion Snoeijen – Senior Software Engineer / Tech Lead</h1>
      <p className="mb-2">📍 Veldhoven · 📞 06-21819181 · ✉️ <a href="mailto:hallo@dionsnoeijen.nl" className="text-blue-600">hallo@dionsnoeijen.nl</a></p>
      <p className="mb-6">🔗 <a href="https://linkedin.com/in/dionsnoeijen" className="text-blue-600">LinkedIn</a> · <a href="https://github.com/dionsnoeijen" className="text-blue-600">GitHub</a></p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Profiel</h2>
        <p>Senior Full-stack Developer met 20+ jaar ervaring in webdevelopment, DevOps en cloudinfrastructuur (AWS, Azure). Gespecialiseerd in backend-architectuur, API-integraties, CI/CD, AI-oplossingen en no-code tooling. Founder van Tardigrades en het AI/no-code platform PolySynergy.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Kerncompetenties</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Backend:</strong> Python, FastAPI, Django, PHP 8.x, Laravel, Symfony</li>
          <li><strong>Frontend:</strong> JavaScript, TypeScript, React (Next.js), Vue</li>
          <li><strong>Cloud & DevOps:</strong> AWS, Azure, Docker, Kubernetes, Terraform, GitOps, CI/CD</li>
          <li><strong>Data & Search:</strong> PostgreSQL, ElasticSearch</li>
          <li><strong>AI & Automation:</strong> OpenAI API, LLM-integraties, no-code / node-based tooling</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Werkervaring</h2>
        <ul className="space-y-4">
          <li>
            <strong>PolySynergy – Founder</strong><br />
            <em>2023 – heden</em><br />
            Bouw van een lokaal of cloudgebaseerd AI/no-code platform voor het visueel ontwikkelen van backendlogica en AI-agentgedrag.
            <ul className="list-disc list-inside ml-4">
              <li>Fullstack development (Node, React, Python)</li>
              <li>AI-integraties, contextueel prompt design, workflows</li>
              <li>Electron wrapper voor native lokale uitvoering</li>
              <li>AWS CI/CD, Terraform, ECS</li>
              <li>Positionering tegenover n8n / Make, met focus op controle en uitbreidbaarheid</li>
            </ul>
          </li>

          <li>
            <strong>Joij – Interim Lead Developer</strong><br />
            <em>2021 – 2024</em><br />
            Leidend in techniek én strategie binnen een SaaS-organisatie gericht op freelancers.
            <ul className="list-disc list-inside ml-4">
              <li>Complex facturatiesysteem (event sourcing)</li>
              <li>Realtime dashboards met ElasticSearch</li>
              <li>Multi-tenant architectuur met geautomatiseerde provisioning</li>
              <li>DevOps workflows in Azure, Docker, GitOps, Terraform</li>
              <li>AI-integratie en teamcoaching junior devs</li>
            </ul>
          </li>

          <li>
            <strong>PsyBizz – Senior Developer</strong><br />
            <em>2015 – 2021</em><br />
            Symfony backend voor assessmentplatform
            <ul className="list-disc list-inside ml-4">
              <li>CI/CD pipelines in AWS</li>
              <li>Microservices, DDD, event sourcing</li>
              <li>Aanspreekpunt voor management en technische vertaalslag</li>
            </ul>
          </li>

          <li>
            <strong>Tardigrades – Freelance Developer / Founder</strong><br />
            <em>2019 – heden</em><br />
            Eigen label voor freelanceopdrachten en open source no-code tool Octopus.
          </li>

          <li>
            <strong>Eerdere functies</strong><br />
            Middlemen (2014–2015), WebEngine (2012–2014), Webs (2010–2012), APSBB/Canday (2007–2010), Octografx/VCS (2000–2006)
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Opleidingen & Certificering</h2>
        <ul className="list-disc list-inside">
          <li>ICN Solutions – Autodesk Inventor Training</li>
          <li>Middelbare school – Bouwkunde</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Talen</h2>
        <p>Nederlands – Moedertaal · Engels – Vloeiend</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Extra</h2>
        <p>Hobby’s: Muziek, Blender 3D, tekenen, filosofie, creative coding</p>
        <p>Combineert technische expertise met visie, storytelling en design</p>
      </section>

      <div className="mt-12">
        <a href="/cv-2025-dion-snoeijen.pdf" download className="text-blue-600 underline">
          Download als PDF
        </a>
      </div>
    </main>
  );
}