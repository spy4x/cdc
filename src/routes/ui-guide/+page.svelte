<script>
  import { GoBack } from '@components';
</script>

<div class="p-8 space-y-8">
  <h1>UI-guide</h1>

  <section class="grid md:grid-cols-2">
    <div>
      <h1 class="h1">Skeleton H1</h1>
      <h2 class="h2">Skeleton H2</h2>
      <h3 class="h3">Skeleton H3</h3>
      <h4 class="h4">Skeleton H4</h4>
      <h5 class="h5">Skeleton H5</h5>
      <h6 class="h6">Skeleton H6</h6>
    </div>

    <div>
      <header class="flex items-center -m-4 mb-0 lg:m-0 lg:mb-8 gap-4">
        <GoBack />
        <h1 class="h2 uppercase hidden md:flex">Back</h1>
      </header>
    </div>
  </section>

  <div>
    <p class="mb-4">In some cases btn need a wrap like div.relative.z-0</p>
    <section class="flex flex-wrap items-center gap-4">
      <button type="button" class="btn variant-filled-primary">primary</button>
      <button type="button" class="btn variant-filled-secondary">secondary</button>
      <button type="button" class="btn variant-filled-tertiary">tertiary</button>
      <button type="button" class="btn variant-filled-success">success</button>
      <button type="button" class="btn variant-filled-warning">warning</button>
      <button type="button" class="btn variant-filled-error">error</button>
      <button type="button" class="btn variant-filled-surface">surface</button>
      <button type="button" class="btn variant-filled-edit">edit</button>
    </section>
  </div>
  <section class="flex flex-wrap items-center gap-4">
    <button type="button" class="btn btn-sm variant-filled">sm</button>
    <button type="button" class="btn variant-filled">base</button>
    <button type="button" class="btn btn-lg variant-filled">lg</button>
    <button type="button" class="btn btn-xl variant-filled">xl</button>
  </section>
  <section class="flex flex-wrap items-center gap-4">
    <div class="variant-filled-primary p-2">primary</div>
    <div class="variant-filled-secondary p-2">secondary</div>
    <div class="variant-filled-tertiary p-2">tertiary</div>
    <div class="variant-filled-success p-2">success</div>
    <div class="variant-filled-warning p-2">warning</div>
    <div class="variant-filled-error p-2">error</div>
    <div class="variant-filled-surface p-2">surface</div>
  </section>
  <section class="flex flex-wrap items-center gap-4">
    <label>
      <span>Email</span>
      <input class="input" type="email" placeholder="Enter email" />
      <span class="text-red-500">$auth.error.body?.email._errors</span>
    </label>
  </section>
  <section>
    <div class="flex flex-col gap-5 max-w-md mx-auto bg-gray-50 p-6 lg:p-8 rounded-3xl border-2 border-gray-300">
      Example wrap for form
    </div>
  </section>
  <section class="grid grid-cols-1 md:grid-cols-3 gap-10">
    <div class="paper-stack" />

    <div class="paper-stack">
      <a href="/boxes/pirate-adventures" class="flex flex-col overflow-hidden">
        <div class="relative">
          <img
            class="w-full h-48 object-cover"
            src="https://www.shutterstock.com/image-vector/funny-kids-pirates-cartoon-children-600w-1557648809.jpg"
            alt="Pirate Adventures"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50" />
        </div>
        <div class="p-4">
          <h3 class="text-lg">Pirate Adventures</h3>
        </div>
      </a>
    </div>

    <div class="paper-stack">
      <a href="/boxes/pirate-adventures" class="flex flex-col overflow-hidden">
        <div class="relative">
          <img
            class="w-full h-48 object-cover"
            src="https://www.shutterstock.com/image-vector/funny-kids-pirates-cartoon-children-600w-1557648809.jpg"
            alt="Pirate Adventures"
          />
        </div>
        <div class="p-4">
          <h3 class="text-lg">Pirate Adventures</h3>
        </div>
      </a>
    </div>
  </section>
</div>
