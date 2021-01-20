import test from 'ava';
import { lint, formatters } from 'stylelint';

import { DEFAULT_CSS, transform } from '../src';

test(`The default CSS is valid`, async (assert) => {
  const output = await lint({
    code: DEFAULT_CSS,
    config: {
      extends: `stylelint-config-standard`
    }
  });

  assert.false(output.errored, `CSS errors: ${formatters.compact(output.results)}`);
});

test(`Unmarked code is untouched`, (assert) => {
  const input = 'This is `code`.';
  assert.deepEqual(transform(input), input);
});

test(`escaped code is untouched`, (assert) => {
  const input = 'This is [`<code>\\` html]`.';
  assert.deepEqual(transform(input), input);
});

test(`marked code is transformed`, (assert) => {
  const input = 'This is [`<code>` html].';
  const expected = `This is <code class="language-html">&lt;code&gt;</code>.`;
  assert.deepEqual(transform(input), expected);
});

test(`transformation isn't greedy`, (assert) => {
  const input = 'This is [`<code>` html].';
  const expected = `This is <code class="language-html">&lt;code&gt;</code>.`;
  assert.deepEqual(transform(input + input), expected + expected);
});
