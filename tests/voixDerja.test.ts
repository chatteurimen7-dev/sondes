import { describe, expect, it } from 'vitest';
import { aSynthetiser, aUnTexteArabe, adresseSynthese, construireSsml, echapperXml } from '../src/domain/voixDerja';

describe('voix en derja', () => {
  it('construit une requête avec la voix tunisienne et une vitesse un peu réduite', () => {
    const ssml = construireSsml('مرحبا بيك');
    expect(ssml).toContain('xml:lang="ar-TN"');
    expect(ssml).toContain('name="ar-TN-ReemNeural"');
    expect(ssml).toContain('rate="-8%"');
    expect(ssml).toContain('مرحبا بيك');
  });

  it('protège les caractères spéciaux', () => {
    expect(echapperXml('a & b < c "d"')).toBe('a &amp; b &lt; c &quot;d&quot;');
    expect(construireSsml('x < y')).toContain('x &lt; y');
  });

  it('reconnaît un texte en écriture arabe', () => {
    expect(aUnTexteArabe('عسلامة')).toBe(true);
    expect(aUnTexteArabe('Bonjour')).toBe(false);
  });

  it('ne synthétise que les messages en arabe qui ne sont pas à refaire', () => {
    expect(aSynthetiser({ texte: 'عسلامة', statut: 'brouillon' })).toBe(true);
    expect(aSynthetiser({ texte: 'عسلامة', statut: 'valide' })).toBe(true);
    expect(aSynthetiser({ texte: 'عسلامة', statut: 'a_refaire' })).toBe(false);
    expect(aSynthetiser({ texte: 'hello', statut: 'brouillon' })).toBe(false);
    expect(aSynthetiser(undefined)).toBe(false);
  });

  it('forme l’adresse du service selon la région', () => {
    expect(adresseSynthese('francecentral')).toBe('https://francecentral.tts.speech.microsoft.com/cognitiveservices/v1');
  });
});
