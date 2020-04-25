<script>
  import { _ } from 'svelte-i18n'
</script>

<style>
  h1,
  figure,
  p {
    text-align: center;
    margin: 0 auto;
  }

  h1 {
    font-size: 2.8em;
    text-transform: uppercase;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }

  figure {
    margin: 0 0 1em 0;
  }

  img {
    width: 100%;
    max-width: 400px;
    margin: 0 0 1em 0;
  }

  p {
    margin: 1em auto;
  }

  @media (min-width: 480px) {
    h1 {
      font-size: 4em;
    }
  }
</style>

<svelte:head>
  <title>{$_('title.index', { default: 'Sapper project template!' })}</title>
</svelte:head>

<h1>{$_('messages.success', { default: 'Great success!' })}</h1>

<figure>
  <img alt="Borat" src="great-success.png" />
  <figcaption>{$_('messages.high_five', { default: 'High five' })}</figcaption>
</figure>

<p>
  <strong>
    {$_('messages.try_editing', {
      default:
        'Try editing this file (src/routes/index.svelte) to test live reloading.',
    })}
  </strong>
</p>
