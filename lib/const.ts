const dummyData = {
  faq: [
    [
      "1 . How does Upstash handle consistency in its replication mechanism?",
      "Upstash utilizes a leader-based replication " +
        "mechanism where each key is assigned to a leader replica" +
        " responsible for handling write operations on that key. " +
        "The leader processes a write operation first and then " +
        "asynchronously propagates it to the backup replicas to maintain" +
        " data consistency. Reads can be performed from any replica.",
    ],
    [
      "2 . What happens when the leader replica fails in Upstash?",
      "If the leader replica fails, the remaining replicas start a new leader election round to elect a new leader." +
        " During this process, there may be a short unavailability window where" +
        " write requests can be blocked for a brief period of time. Anti-entropy" +
        " jobs run periodically in case of cluster wide failures like network" +
        " partitioning to resolve conflicts using the `Last-Writer-Wins`" +
        " algorithm and converge the replicas to the same state.",
    ],
    [
      "3 . What level of consistency does Upstash provide?",
      "Upstash provides **Eventual Consistency** by default, but it also offers **Causal Consistency** guarantees" +
        " (`Read-Your-Writes`, `Monotonic-Reads`, `Monotonic-Writes`, and `Writes-Follow-Reads`)" +
        " for a single Redis connection. This level of consistency is achieved by" +
        " forming a session between the client and server through a TCP connection.",
    ],
    [
      "4 . Why did Upstash deprecate the 'Strong Consistency' mode for single region databases?",
      "Upstash decided to deprecate the 'Strong Consistency' mode for single region databases due to its impact on" +
        " latency conflicting with the performance expectations of Redis use cases. Additionally," +
        " Upstash is gradually transitioning to **CRDT** based Redis data structures," +
        " which will provide `Strong Eventual Consistency`.",
    ],
    [
      "5 . How does Upstash ensure consistency during network partitioning and failures?",
      "During network partitioning and failures, Upstash runs anti-entropy jobs periodically" +
        " to resolve conflicts using the `Last-Writer-Wins` algorithm and converge the replicas" +
        " to the same state. This process ensures that consistency is maintained even" +
        " in scenarios of cluster-wide failures like network partitioning.",
    ],
  ],
};

export { dummyData };
