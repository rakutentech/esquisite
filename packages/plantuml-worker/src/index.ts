import { spawn, ChildProcess } from 'child_process';
import { Transform, TransformCallback, Writable } from 'stream';
import { createHash } from 'crypto';
import * as console from 'console';

import * as split_ from 'split2';

import { Options } from '../types';

const split = split_;

const DEFAULT_OPTIONS: Partial<Options> = {
  env: { PLANTUML_LIMIT_SIZE: 32768 },
  include: process.cwd(),
  jar: require.resolve('../vendor/plantuml.1.2020.14.jar'),
  maxHeap: '4G',
  ttl: 2500
};

const makeDigest = (x: string) => createHash('sha512').update(x, 'utf8').digest('base64');

const DELIMITER = '___PLANTUML_DIAGRAM_DELIMITER___';
const SPLITTER = split(DELIMITER);

const javaArgs = (options: Options) => [
  '-Djava.awt.headless=true',
  '-Dapple.awt.UIElement=true',
  '-Dfile.encoding=UTF-8',
  `-Dplantuml.include.path='${options.include}'`,
  `-Xmx${options.maxHeap}`,
  '-XX:+HeapDumpOnOutOfMemoryError',
  '-jar',
  options.jar,
  '-tsvg',
  '-pipe',
  '-pipeNoStderr',
  '-pipedelimitor',
  DELIMITER
];

// PlantUML outputs a delimiter after each output so we have to ignore
// any final one instead of returning an empty SVG
class SkipEmptyChunks extends Transform {
  _transform(chunk: any, _encoding: BufferEncoding, callback: TransformCallback) {
    if (chunk.length > 0) this.push(chunk);
    callback();
  }
}

interface Client {
  callback?: (value: string | Error) => void;
  promise: Promise<string | Error>;
}

class PlantUML {
  digests: string[];
  clients: Record<string, Client>;
  task: ChildProcess;
  sink: Writable;

  constructor(options: Options) {
    // Keep track of the diagrams we're generating. The digest of the diagram
    // we're getting a rendering of next is digests[processed].
    this.digests = [];

    // Diagram digest-keyed { promise, callback } objects, for calling back
    // clients and resolving already-rendered diagrams.
    this.clients = {};

    // How many diagrams we've already processed (aka index of the next
    // diagram's digest).
    let processed = 0;

    // Spawn PlantUML
    this.task = spawn('java', javaArgs(options), {
      env: { ...process.env, ...options.env }
    });

    // generate() will pipe the diagram's source into this sink
    this.sink = this.task.stdin!;

    // Watch over everything that PlantUML generates for us
    const complete = (result: string | Error) => {
      const digest = this.digests[processed];
      if (typeof digest === 'undefined') {
        return;
      }

      const client = this.clients[digest];
      if (typeof client === 'undefined') {
        return;
      }

      const { callback } = client;
      if (typeof callback === 'undefined') {
        return;
      }

      processed += 1;
      delete client.callback;

      callback(result);
    };

    this.task
      .stdout!.pipe(SPLITTER)
      .pipe(new SkipEmptyChunks())
      .on('data', (buffer) => {
        const svg = buffer.toString().trim();
        complete(svg.startsWith('ERROR') ? new Error(svg) : svg);
      });

    this.task.on('close', (code) => {
      complete(
        new Error(`=== PlantUML instance exited with exit code ${code}. Options = ${options}`)
      );
    });
  }

  async generate(source: string): Promise<string | Error> {
    const digest = makeDigest(source);

    // If we've already seen that diagram, we just hook onto the existing promise
    const client = this.clients[digest];
    const previous = client?.promise;
    if (typeof previous !== 'undefined')
      return new Promise((cb) => previous.then((result: string | Error) => cb(result)));

    // Else, we create a new one and enqueue the source along with the client info
    let callback;
    const promise = new Promise<string | Error>((cb) => (callback = cb));

    this.digests.push(digest);
    this.clients[digest] = { callback, promise };
    this.sink.write(`${source}\n`);

    return promise;
  }

  close() {
    this.sink.end();
  }
}

const cachedInstances: Record<string, PlantUML> = {};
const timeouts: Record<string, NodeJS.Timeout> = {};

function getInstance(overrides: Partial<Options>): PlantUML {
  const options = { ...DEFAULT_OPTIONS, ...overrides } as Options;
  const optionsDigest = makeDigest(JSON.stringify(options));

  // If we had a previous TTL timeout, clear it
  const timeout = timeouts[optionsDigest];
  if (typeof timeout !== 'undefined') {
    console.debug(`Keeping PlantUML-${optionsDigest} alive…`);
    clearTimeout(timeout);
    delete timeouts[optionsDigest];
  }

  // Get or create the instance
  let instance = cachedInstances[optionsDigest];
  if (typeof instance === 'undefined') {
    console.debug(`Creating PlantUML-${optionsDigest}…`);
    instance = new PlantUML(options);
    cachedInstances[optionsDigest] = instance;
  }

  // Set the TTL timeout
  timeouts[optionsDigest] = setTimeout(() => {
    console.debug(`PlantUML-${optionsDigest} timed out, closing…`);
    cachedInstances[optionsDigest]?.close();
    delete cachedInstances[optionsDigest];
    delete timeouts[optionsDigest];
  }, options.ttl);

  return instance;
}

export default async function plantuml(source: string, options: Options): Promise<string | Error> {
  return getInstance(options).generate(source);
}
